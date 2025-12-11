const spotifyApi = require('../config/spotify');
const User = require('../models/User');

// Ruta para verificar la autenticación del usuario (Admin)
exports.checkSession = (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      authenticated: true,
      user: req.session.user,
      access: req.session.access
    });
  } else {
    res.status(200).json({ authenticated: false });
  }
};

// Ruta para entrar al administrador
exports.adminLogin = (req, res) => {
  res.status(200).json({ message: 'Quiero llorar' }); // Tu mensaje original :)
};

// Ruta para salir del administrador
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Asegurarse de limpiar la cookie de la sesión
    res.status(200).json({ message: 'Logout successful' });
  });
};

// Ruta para token de acceso
exports.getSpotifyToken = async (req, res) => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    res.json({ accessToken: data.body['access_token'] });
  } catch (error) {
    console.error('Error al obtener el token de acceso:', error);
    res.status(500).json({ error: 'Error al obtener el token de acceso' });
  }
};

// Ruta para iniciar el flujo de autenticación del usuario
exports.spotifyLogin = (req, res) => {
  const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, encodeURIComponent(process.env.FRONTEND_URL));
  res.redirect(authorizeURL);
};

// Callback para manejar la redirección después de la autenticación del usuario
exports.spotifyCallback = async (req, res) => {
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
      const redirectBase = decodeURIComponent(req.query.state || process.env.FRONTEND_URL);
      res.redirect(`${redirectBase}?access_token=${access_token}&refresh_token=${refresh_token}`);
    } else {
      console.error('La sesión no está disponible.');
      res.redirect('/error');
    }
  } catch (error) {
    console.error('Error durante la autorización:', error);
    res.redirect('/error');
  }
};