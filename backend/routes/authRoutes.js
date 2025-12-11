const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const login = require('../middleware/auth'); // Middleware de autenticación original

// Rutas de Sesión y Admin
router.get('/check-session', authController.checkSession);
router.post('/admin-login', login, authController.adminLogin); // Middleware 'login' se ejecuta antes
router.post('/logout', authController.logout);

// Rutas de Autenticación Spotify
router.get('/spotify/token', authController.getSpotifyToken);

// Rutas de OAuth Spotify (Login de usuario)
router.get('/login', authController.spotifyLogin);
router.get('/callback', authController.spotifyCallback);

module.exports = router;