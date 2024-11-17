require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const morgan = require('morgan');
const session = require('express-session');
const connectDB = require('./db');
const app = express();
const port = process.env.PORT || 5000;
const Visit = require('./models/Visit');
const logVisit = require('./middleware/logVisit');
const endVisit = require('./middleware/endVisit');
const Track = require('./models/Track');
const Playlist = require('./models/Playlist');
const User = require('./models/User');
const login = require('./middleware/auth');
const bcrypt = require('bcrypt');


connectDB();

app.use(session({
  secret: '767254632',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Cliente de la API de Spotify con variables de entorno
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:5000/callback'
});
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

//Ruta para entrar al administrador
app.post('/api/admin-login', login);

// Ruta para verificar la autenticación del usuario
app.get('/api/check-auth', (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    res.status(200).json({
      isAuthenticated: true }); }
  else { res.status(200).json({ isAuthenticated: false }); }
});

// Ruta para registrar visitas
app.post('/api/log-visit', logVisit, (req, res) => {
  res.status(200).json({ message: 'Visita registrada con éxito' });
});

//Ruta para terminar visita
app.post('/api/end-visit', async (req, res) => {
  if (req.session.visitId && req.session.visitStart) {
    const visitEnd = Date.now();
    const visitDuration = (visitEnd - req.session.visitStart) / 1000;
    try {
      await Visit.findByIdAndUpdate(req.session.visitId, { duration: visitDuration });
      console.log('Duración de la visita actualizada:', visitDuration, 'segundos');
      res.status(200).json({ message: 'Duración de la visita actualizada' });
    } catch (err) {
      console.error('Error al actualizar la duración de la visita:', err);
      res.status(500).json({ error: 'Error al actualizar la duración de la visita' });
    }
  } else {
    res.status(400).json({ message: 'No hay visita activa en la sesión' });
  }
});

// Ruta para token de acceso
app.get('/api/spotify/token', async (req, res) => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    res.json({ accessToken: data.body['access_token'] });
  } catch (error) {
    console.error('Error al obtener el token de acceso:', error);
    res.status(500).json({ error: 'Error al obtener el token de acceso' });
  }
});

// Ruta para iniciar el flujo de autenticación del usuario
app.get('/login', (req, res) => {
  const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

// Callback para manejar la redirección después de la autenticación del usuario
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    if (req.session) {
      req.session.accessToken = access_token;
      req.session.refreshToken = refresh_token;
      console.log('Tokens de acceso y actualización obtenidos exitosamente.');
      res.redirect(`http://localhost:3000?access_token=${access_token}&refresh_token=${refresh_token}`);
    } else {
      console.error('La sesión no está disponible.');
      res.redirect('/error');
    }
  } catch (error) {
    console.error('Error durante la autorización:', error);
    res.redirect('/error');
  }
});

// Ruta para obtener datos del perfil del usuario autenticado
app.get('/profile', async (req, res) => {
  try {
    const me = await spotifyApi.getMe();
    res.json(me.body);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});

// Ruta para obtener estadísticas
app.get('/api/stats', async (req, res) => {
  const { period } = req.query;
  let startDate;

  // Determinar la fecha de inicio en función del período seleccionado
  switch (period) {
    case 'Last 4 weeks':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);
      break;
    case 'Last 6 months':
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case 'All time':
      startDate = new Date(0); // Fecha de inicio muy antigua
      break;
    default:
      return res.status(400).json({ message: 'Periodo no válido' });
  }

  try {
    const visitors = await Visit.countDocuments({ timestamp: { $gte: startDate } });
    const playlistsCreated = await Playlist.countDocuments({ createdAt: { $gte: startDate } });

    const minutesOfMusic = await Playlist.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, totalDuration: { $sum: '$actualDuration' } } }
    ]);

    const accuracy = await Playlist.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
          _id: null,
          averageAccuracy: {
            $avg: {
              $min: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$actualDuration",
                        "$requestedDuration"
                      ]
                    },
                    100
                  ]
                },
                100
              ]
            }
          }
        }}
    ]);

    const countriesData = await Visit.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const statsData = {
      visitors,
      playlistsCreated,
      minutesOfMusic: minutesOfMusic[0] ? Math.floor(minutesOfMusic[0].totalDuration / 60) : 0,
      countries: countriesData.map(country => ({
        label: country._id,
        value: country.count
      })),
      accuracy: accuracy[0] ? Math.min(accuracy[0].averageAccuracy.toFixed(2), 100) : 0
    };

    res.json(statsData);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});


//Ruta para guardar la playlist en la base de datos
app.post('/api/post-playlist', async (req, res) => {
  const { playlistName, description, tracks, requestedDuration, actualDuration } = req.body;
  try {
    const trackIds = [];

    for (const track of tracks) {
      console.log('Procesando track:', track);
      let existingTrack = await Track.findOne({ spotifyId: track.spotifyId });

      if (!existingTrack) {
        const newTrack = new Track({
          name: track.name,
          artist: track.artist,
          duration: track.duration,
          src: track.src,
          preview_url: track.preview_url,
          spotifyId: track.spotifyId
        });
        existingTrack = await newTrack.save();
        console.log('Nuevo track guardado:', existingTrack);
      } else {
        console.log('Track existente:', existingTrack);
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
});

// Ruta para guardar la playlist en la cuenta del usuario
app.post('/api/save-playlist', async (req, res) => {
  const { playlistName, description, tracks } = req.body;
  const accessToken = req.headers.authorization?.split(' ')[1];

  try {
    if (!tracks || tracks.length === 0) {
      throw new Error('La lista de canciones está vacía o no se proporcionó.');
    }
    if (!accessToken) {
      throw new Error('No token provided.');
    }

    spotifyApi.setAccessToken(accessToken);

    const playlist = await spotifyApi.createPlaylist(playlistName, { description: description, public: true });
    const trackUris = tracks.map(track => `spotify:track:${track.spotifyId}`);
    await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);

    res.json({ message: 'Playlist guardada con éxito', playlistId: playlist.body.id });
  } catch (error) {
    console.error('Error al guardar la playlist:', error);
    res.status(500).json({ error: `Error al guardar la playlist: ${error.message}` });
  }
});


// Ruta para crear una playlist
app.post('/api/playlist', async (req, res) => {
  const { tiempo } = req.body;
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
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
      if (durationDifference === 0) {
        break;  // Terminar si se encuentra una combinación exacta
      }
    }
    res.json(bestCombination);
  } catch (error) {
    console.error('Error al obtener canciones de la playlist:', error);
    res.status(500).json({ error: 'Error al obtener canciones de la playlist' });
  }
});

// Función para aleatorizar la playlist de referencia
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para encontrar la mejor combinación de canciones
function findClosestSum(tracks, targetDuration) {
  let start = 0, end = 0;
  let currSum = tracks[0].duration, minDiff = Number.MAX_SAFE_INTEGER;
  let bestStart = 0, bestEnd = 0;
  minDiff = Math.abs(currSum - targetDuration);
  while (end < tracks.length - 1) {
    if (currSum < targetDuration) {
      end++;
      currSum += tracks[end].duration;
    } else {
      currSum -= tracks[start].duration;
      start++;
    }
    if (Math.abs(currSum - targetDuration) < minDiff) {
      minDiff = Math.abs(currSum - targetDuration);
      bestStart = start;
      bestEnd = end;
    }
  }
  // Añadir más canciones de la lista inicial si es necesario
  while (currSum < targetDuration && end < tracks.length - 1) {
    end++;
    currSum += tracks[end].duration;
    if (Math.abs(currSum - targetDuration) < minDiff) {
      minDiff = Math.abs(currSum - targetDuration);
      bestEnd = end;
    }
  }
  return {
    combination: tracks.slice(bestStart, bestEnd + 1),
    durationDifference: minDiff
  };
}

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
