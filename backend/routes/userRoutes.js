const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de Administración de Usuarios
router.get('/user', userController.getCurrentUser); // Obtener usuario logueado
router.get('/users', userController.getAllUsers);   // Listar todos
router.post('/users', userController.createUser);   // Crear usuario

// Modificaciones de Usuarios
router.put('/users/:userId/access', userController.updateUserAccess);
router.put('/users/:userId/delete', userController.deleteUser); // Borrado lógico

// Actualización de Perfil Propio
router.put('/user/update-info', userController.updateUserInfo);
router.put('/user/update-contact', userController.updateUserContact);
router.put('/user/update-password', userController.updateUserPassword);

// Perfil de Spotify
router.get('/profile', userController.getSpotifyProfile);

module.exports = router;