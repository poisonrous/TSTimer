const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const connectDB = require('./config/db'); // Asegúrate de que tu db.js esté en la carpeta config

// Importar Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const faqRoutes = require('./routes/faqRoutes');
const visitRoutes = require('./routes/visitRoutes');

const app = express();

// Conectar a la Base de Datos
connectDB();

// Middlewares Globales
app.use(morgan('dev'));
app.use(express.json());

// Configuración de Sesión
app.use(session({
  secret: process.env.SESSION_SECRET || '767254632', // Tu secreto original o variable de entorno
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Pon 'true' si usas HTTPS en producción
}));

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("No permitido por CORS"));
        }
      },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Stage"],
    credentials: true
}));

// Middleware "Mágico" para WebSocket
// Esto permite que los controladores accedan a 'req.wss' aunque 'wss' se cree en index.js
app.use((req, res, next) => {
  req.wss = req.app.get('wss');
  next();
});

// Montaje de Rutas (Todas bajo /api)
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', playlistRoutes);
app.use('/api', faqRoutes);
app.use('/api', visitRoutes);

// Manejo básico de errores (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;