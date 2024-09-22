// Cargar variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // Si necesitas permitir solicitudes desde un cliente externo

const app = express();
const port = process.env.PORT || 3000;

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => console.error('Error al conectar a MongoDB:', err));

// Middleware
app.use(cors());  // Permitir solicitudes de dominios externos, necesario para la interacción con una aplicación cliente
app.use(express.json());  // Para analizar JSON en las solicitudes

// Modelo de ejemplo para mensajes
const mensajeSchema = new mongoose.Schema({
  texto: String,
  autor: String,
  fecha: { type: Date, default: Date.now }
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

// Ruta para crear un mensaje
app.post('/mensajes', async (req, res) => {
  try {
    const nuevoMensaje = new Mensaje(req.body);
    await nuevoMensaje.save();
    res.status(201).send(nuevoMensaje);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Ruta para obtener todos los mensajes
app.get('/mensajes', async (req, res) => {
  try {
    const mensajes = await Mensaje.find();
    res.status(200).send(mensajes);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Ruta raíz para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

