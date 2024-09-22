require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;

// Crear un servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir todas las conexiones de cliente
    methods: ['GET', 'POST']
  }
});

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => console.error('Error al conectar a MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Modelo de ejemplo para mensajes
const mensajeSchema = new mongoose.Schema({
  texto: String,
  autor: String,
  fecha: { type: Date, default: Date.now }
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

// Socket.IO: Manejar conexiones y mensajes
io.on('connection', (socket) => {
  console.log('Cliente conectado', socket.id);

  // Cuando el cliente envía un mensaje
  socket.on('enviarMensaje', async (data) => {
    const nuevoMensaje = new Mensaje(data);
    await nuevoMensaje.save();
    
    // Enviar el mensaje a todos los clientes conectados
    io.emit('mensajeRecibido', nuevoMensaje);
  });

  // Enviar mensajes existentes al cliente cuando se conecta
  Mensaje.find().then((mensajes) => {
    socket.emit('cargarMensajes', mensajes);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });
});

// Ruta para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente con Socket.IO!');
});

// Iniciar el servidor con Socket.IO
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
