const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

// Generar playlist
router.post('/playlist', playlistController.generatePlaylist);

// Guardar en Base de Datos interna
router.post('/post-playlist', playlistController.savePlaylistToDb);

// Guardar en cuenta de Spotify del usuario
router.post('/save-playlist', playlistController.savePlaylistToSpotify);

// Obtener contador de guardados
router.get('/playlist/:id/save-count', playlistController.getPlaylistSaveCount);

module.exports = router;