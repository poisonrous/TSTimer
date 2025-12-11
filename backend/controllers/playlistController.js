const spotifyApi = require('../config/spotify');
const Track = require('../models/Track');
const Playlist = require('../models/Playlist');
const WebSocket = require('ws');
const { getPreviewUrl, shuffleArray, findClosestSum } = require('../utils/helpers');

// Ruta para crear la playlist
exports.generatePlaylist = async (req, res) => {
  const { tiempo } = req.body;
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
  const wss = req.wss; // WebSocket Server inyectado desde server.js

  try {
    const token = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(token.body['access_token']);
    
    let allTracks = [];
    let offset = 0;
    let limit = 100;
    let total = 0;

    // Obtener todas las canciones de la playlist de referencia
    do {
      const response = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
      const tracks = response.body.items.map(item => ({
        spotifyId: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        duration: item.track.duration_ms / 1000,
        src: item.track.album.images[0].url,
        preview_url: item.track.preview_url,
      }));
      allTracks = allTracks.concat(tracks);
      offset += limit;
      total = response.body.total;
    } while (offset < total);

    let bestCombination = null;
    let bestDurationDifference = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < 10; i++) {
      const shuffledTracks = shuffleArray([...allTracks]);
      const { combination, durationDifference } = findClosestSum(shuffledTracks, tiempo);
      if (durationDifference < bestDurationDifference) {
        bestCombination = combination;
        bestDurationDifference = durationDifference;
      }
      if (durationDifference === 0) break; 
    }
    
    res.json(bestCombination);

    // Obtener URLs de previsualización en segundo plano y enviar por WebSocket
    (async () => {
        for (const track of bestCombination) {
            if (!track.preview_url) {
                track.preview_url = await getPreviewUrl(`https://open.spotify.com/embed/track/${track.spotifyId}`);
            }
            // Enviar mensaje por WebSocket si encontramos preview
            if (track.preview_url) {
                const message = JSON.stringify({ spotifyId: track.spotifyId, preview_url: track.preview_url });
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            }
        }
    })();

  } catch (error) {
    console.error('Error al obtener canciones de la playlist:', error);
    res.status(500).json({ error: 'Error al obtener canciones de la playlist' });
  }
};

// Ruta para guardar la playlist en la base de datos
exports.savePlaylistToDb = async (req, res) => {
  console.log(req.session);
  const { playlistName, description, tracks, requestedDuration, actualDuration } = req.body;
  
  try {
    const trackIds = [];

    for (const track of tracks) {
      console.log('Procesando track:', track);
      let existingTrack = await Track.findOne({ spotifyId: track.spotifyId });
      const embedUrl = `https://open.spotify.com/embed/track/$${track.spotifyId}`;

      if (!existingTrack) {
        let previewUrlToSave = track.preview_url;
        if (!previewUrlToSave) {
             console.log(`Track nuevo ${track.name} sin preview. Buscando...`);
             previewUrlToSave = await getPreviewUrl(embedUrl);
        }
        
        const newTrack = new Track({
          name: track.name,
          artist: track.artist,
          duration: track.duration,
          src: track.src,
          preview_url: previewUrlToSave,
          spotifyId: track.spotifyId
        });
        existingTrack = await newTrack.save();
        console.log('Nuevo track guardado:', existingTrack);
      } else {
        if (!existingTrack.preview_url) {
          console.log(`Track existente ${track.name} sin preview. Buscando...`);
          const previewUrlToSave = await getPreviewUrl(embedUrl);
          existingTrack = await Track.findByIdAndUpdate(
              existingTrack._id,
              { preview_url: previewUrlToSave },
              { new: true }
          );
          console.log('Track actualizado con preview_url:', existingTrack);
        } else console.log('Track existente:', existingTrack);
      }

      trackIds.push(existingTrack._id);
    }

    const newPlaylist = new Playlist({
      name: playlistName,
      description: description,
      tracks: trackIds,
      requestedDuration: requestedDuration,
      actualDuration: actualDuration
    });

    const savedPlaylist = await newPlaylist.save();
    console.log('Playlist registrada con éxito:', savedPlaylist);

    res.status(201).json({ message: 'Playlist registrada con éxito', playlistId: savedPlaylist._id });
  } catch (error) {
    console.error('Error al registrar la playlist:', error);
    res.status(500).json({ error: `Error al registrar la playlist: ${error.message}` });
  }
};

// Ruta para guardar la playlist en la cuenta del usuario (Spotify)
exports.savePlaylistToSpotify = async (req, res) => {
  console.log("guardando playlist id: " + req.body.playlistId);
  const { playlistId, playlistName, description, tracks } = req.body;
  const accessToken = req.headers.authorization?.split(' ')[1];
  
  try {
    if (!tracks || tracks.length === 0) throw new Error('La lista de canciones está vacía o no se proporcionó.');
    if (!accessToken) throw new Error('No token provided.');

    spotifyApi.setAccessToken(accessToken);

    const playlist = await spotifyApi.createPlaylist(playlistName, { description: description, public: true });
    const trackUris = tracks.map(track => `spotify:track:${track.spotifyId}`);
    await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);

    // Incrementar el saveCount en la base de datos si la playlist ya existe
    const existingPlaylist = await Playlist.findById(playlistId);
    if (existingPlaylist) {
      existingPlaylist.saveCount += 1;
      await existingPlaylist.save();
    }

    res.json({ message: 'Playlist guardada con éxito', playlistId: playlist.body.id });
  } catch (error) {
    console.error('Error al guardar la playlist:', error);
    res.status(500).json({ error: `Error al guardar la playlist: ${error.message}` });
  }
};

// Ruta para comprobar saveCount
exports.getPlaylistSaveCount = async (req, res) => {
  const playlistId = req.params.id;
  try {
    const playlist = await Playlist.findById(playlistId);
    if (playlist) {
      res.json({ saveCount: playlist.saveCount });
    } else {
      res.status(404).json({ error: 'Playlist not found' });
    }
  } catch (error) {
    console.error('Error al obtener el saveCount de la playlist:', error);
    res.status(500).json({ error: `Error al obtener el saveCount de la playlist: ${error.message}` });
  }
};