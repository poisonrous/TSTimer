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
const FAQ = require('./models/Faq');
const User = require('./models/User');
const login = require('./middleware/auth');
const bcrypt = require('bcrypt');
const axios = require('axios');
const cheerio = require('cheerio');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

app.use(session({
  secret: '767254632',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

connectDB();

// Cliente de la API de Spotify con variables de entorno
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${process.env.SPOTIFY_REDIRECT_URI}`
});
app.use(morgan('dev'));
app.use(express.json());

//CORS
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

//Web socket
wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  ws.on('message', (message) => {
    console.log('Recibido:', message);
  });
});


//Ruta para recuperar datos del administrador
app.get('/api/user', async (req, res) => {
  console.log(req.session.user);
  try {
    const user = await User.findById(req.session.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ruta para verificar la autenticación del usuario
app.get('/api/check-session', (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      authenticated: true,
      user: req.session.user,
      access: req.session.access
    });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

//Ruta para entrar al administrador
app.post('/api/admin-login', login, (req, res) => {
  res.status(200).json({ message: 'Quiero llorar' });
});
//Ruta para salir del administrador
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Asegurarse de limpiar la cookie de la sesión
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Ruta para obtener todos los usuarios no eliminados
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null }); // Filtrar usuarios no eliminados
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, username, email, phone, password, access } = req.body;

  // Asegurarse de que todos los campos requeridos están presentes
  if (!name || !username || !email || !phone || !password || access === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Verificar si el nombre de usuario ya existe
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Verificar si el correo ya existe
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Verificar si el teléfono ya existe
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      access
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Invalid data' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Ruta para actualizar el tipo de acceso de un usuario
app.put('/api/users/:userId/access', async (req, res) => {
  const { userId } = req.params;
  const { access } = req.body;

  try {
    // Actualizar el acceso del usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { access },
        { new: true, runValidators: true } // Retorna el usuario actualizado y valida el nuevo valor
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar el acceso del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el acceso del usuario' });
  }
});


// Ruta para borrar lógicamente un usuario
app.put('/api/users/:userId/delete', async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;
  const authenticatedUserId = req.session.user;

  try {
    const authenticatedUser = await User.findById(authenticatedUserId);

    // Verificar la contraseña del usuario autenticado
    const isMatch = await bcrypt.compare(password, authenticatedUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Verificar si la cuenta que se intenta eliminar es la única con access 0
    const userToDelete = await User.findById(userId);
    if (userToDelete.access === 0) {
      const otherAdmins = await User.find({ access: 0, _id: { $ne: userId }, deletedAt: { $exists: false } });
      if (otherAdmins.length === 0) {
        return res.status(400).json({ error: "You can't delete this account as it's the only Super user." });
      }
    }

    // Marcar la cuenta como eliminada
    userToDelete.deletedAt = new Date();
    await userToDelete.save();

    // Limpiar la sesión si el usuario está eliminando su propia cuenta
    if (userId === authenticatedUserId) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al destruir la sesión' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Cuenta eliminada con éxito' });
      });
    } else {
      return res.status(200).json({ message: 'Cuenta eliminada con éxito' });
    }
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});
async function canDeleteUser(userId) {
  const user = await User.findById(userId);
  if (user.access !== 0) {
    return true;
  }

  const otherAdminUsers = await User.find({ _id: { $ne: userId }, access: 0, deletedAt: { $exists: false } });
  return otherAdminUsers.length > 0;
}


//Ruta para guardar cambios en la info del usuario
app.put('/api/user/update-info', async (req, res) => {
  const { userId, name, username, password } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, username },
        { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar la información del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar la información del usuario' });
  }
});

//Ruta para guardar cambios en los datos de contacto
app.put('/api/user/update-contact', async (req, res) => {
  const { userId, email, phone, password } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { email, phone },
        { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar la información de contacto del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar la información de contacto del usuario' });
  }
});

//Ruta para cambiar la contraseña
app.put('/api/user/update-password', async (req, res) => {
  const { userId, newPassword, password } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar la contraseña del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña del usuario' });
  }
});

// Ruta para obtener todas las preguntas visibles
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find({ deletedAt: null });
    res.status(200).json(faqs);
  } catch (error) {
    console.error('Error al obtener las preguntas:', error);
    res.status(500).json({ error: 'Error al obtener las preguntas' });
  }
});

// Crear una nueva pregunta
app.post('/api/faqs', async (req, res) => {
  try {
    const newFAQ = new FAQ(req.body);
    const savedFAQ = await newFAQ.save();
    res.status(201).json(savedFAQ);
  } catch (error) {
    console.error('Error al crear la pregunta:', error);
    res.status(500).json({ error: 'Error al crear la pregunta' });
  }
});

// Actualizar una pregunta
app.put('/api/faqs/:id', async (req, res) => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedFAQ);
  } catch (error) {
    console.error('Error al actualizar la pregunta:', error);
    res.status(500).json({ error: 'Error al actualizar la pregunta' });
  }
});

// Cambiar visibilidad de una pregunta
app.patch('/api/faqs/:id/visibility', async (req, res) => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(
        req.params.id,
        { visible: req.body.visible },
        { new: true }
    );
    res.status(200).json(updatedFAQ);
  } catch (error) {
    console.error('Error al cambiar la visibilidad de la pregunta:', error);
    res.status(500).json({ error: 'Error al cambiar la visibilidad de la pregunta' });
  }
});

// Eliminar una pregunta (eliminación lógica)
app.put('/api/faqs/:id/delete', async (req, res) => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(
        req.params.id,
        { deletedAt: new Date() },
        { new: true }
    );
    res.status(200).json(updatedFAQ);
  } catch (error) {
    console.error('Error al eliminar la pregunta:', error);
    res.status(500).json({ error: 'Error al eliminar la pregunta' });
  }
});


//Ruta para guardar la playlist en la base de datos
app.post('/api/post-playlist', async (req, res) => {
  console.log(req.session);
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

// Ruta para registrar visitas
app.post('/api/log-visit', logVisit, (req, res) => {
  res.status(200).json({ message: 'Visita registrada con éxito' });
});

//Ruta para terminar visita
app.post('/api/end-visit', async (req, res) => {
  console.log(req.session);
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
      res.redirect(`${req.headers.origin}?access_token=${access_token}&refresh_token=${refresh_token}`);
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

    const savedPlaylists = await Playlist.countDocuments({ createdAt: { $gte: startDate }, saveCount: { $gt: 0 } });

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
      savedPlaylists
    };

    res.json(statsData);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});


// Ruta para guardar la playlist en la cuenta del usuario
app.post('/api/save-playlist', async (req, res) => {
  console.log("guardando playlist id: " + req.body.playlistId);
  const { playlistId, playlistName, description, tracks } = req.body; // Incluimos playlistId en la solicitud
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
});

//Ruta para comprobar saveCount
app.get('/api/playlist/:id/save-count', async (req, res) => {
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
});

// Función para hacer scraping y obtener el URL de previsualización
async function getPreviewUrl(trackUrl) {
  try {
    const response = await axios.get(trackUrl);
    const $ = cheerio.load(response.data);
    const previewUrl = $('meta[property="og:audio"]').attr('content');
    return previewUrl;
  } catch (error) {
    console.error('Error al hacer scraping:', error);
    return null;
  }
}
//Ruta para crear la playlist
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

    // Obtener URLs de previsualización en segundo plano
    const promises = bestCombination.map(async (track) => {
      if (!track.preview_url) {
        track.preview_url = await getPreviewUrl(`https://open.spotify.com/track/${track.spotifyId}`);
      }
      return track;
    });
    const updatedCombination = await Promise.all(promises);

    // Enviar los URLs de previsualización al cliente WebSocket
    updatedCombination.forEach(track => {
      const message = JSON.stringify({ spotifyId: track.spotifyId, preview_url: track.preview_url });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
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
