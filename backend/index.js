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

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Ruta para registrar visitas
app.post('/api/log-visit', logVisit, (req, res) => {
  res.status(200).json({ message: 'Visita registrada con éxito' });
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
    spotifyApi.setAccessToken(accessToken); // Usar el token de acceso del usuario
    const playlist = await spotifyApi.createPlaylist(playlistName, { 'description': description, 'public': true });
    const trackUris = tracks.map(track => `spotify:track:${track.id}`);
    const addTracksResponse = await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);
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
        id: item.track.id,
        nombre: item.track.name,
        artista: item.track.artists[0].name,
        duracion: item.track.duration_ms / 1000,
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
  let currSum = tracks[0].duracion, minDiff = Number.MAX_SAFE_INTEGER;
  let bestStart = 0, bestEnd = 0;
  minDiff = Math.abs(currSum - targetDuration);
  while (end < tracks.length - 1) {
    if (currSum < targetDuration) {
      end++;
      currSum += tracks[end].duracion;
    } else {
      currSum -= tracks[start].duracion;
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
    currSum += tracks[end].duracion;
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
