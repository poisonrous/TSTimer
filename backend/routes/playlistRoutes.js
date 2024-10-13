const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const Visitor = require('../models/Visitor');

// Crear una nueva playlist
router.post('/', async (req, res) => {
  try {
    const { name, description, tracks, visitorId, requestedDuration } = req.body;

    const trackDocs = await Promise.all(tracks.map(async (track) => {
      let existingTrack = await Track.findOne({ spotifyId: track.spotifyId });
      if (existingTrack) {
        return existingTrack;
      } else {
        const newTrack = new Track(track);
        await newTrack.save();
        return newTrack;
      }
    }));

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ msg: 'Visitor not found' });
    }

    const playlist = new Playlist({
      name,
      description,
      tracks: trackDocs.map(track => track._id),
      visitor: visitorId,
      requestedDuration,
      actualDuration: trackDocs.reduce((sum, track) => sum + track.duration, 0) // Calcular la duración total de las canciones
    });

    await playlist.save();

    visitor.playlistsCreated += 1;
    await visitor.save();

    res.json({ message: 'Playlist guardada con éxito', playlistId: playlist._id });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
