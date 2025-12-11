const User = require('../models/User');
const bcrypt = require('bcrypt');
const spotifyApi = require('../config/spotify');

// Ruta para recuperar datos del administrador (Usuario actual)
exports.getCurrentUser = async (req, res) => {
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
};

// Ruta para obtener todos los usuarios no eliminados
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null }); // Filtrar usuarios no eliminados
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear usuario nuevo
exports.createUser = async (req, res) => {
  const { name, username, email, phone, password, access } = req.body;

  // Asegurarse de que todos los campos requeridos están presentes
  if (!name || !username || !email || !phone || !password || access === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Validaciones de existencia (username, email, phone)...
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ error: 'Username already exists' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email already exists' });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ error: 'Phone number already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, username, email, phone,
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
};

// Ruta para actualizar el tipo de acceso de un usuario
exports.updateUserAccess = async (req, res) => {
  const { userId } = req.params;
  const { access } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { access },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar el acceso del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el acceso del usuario' });
  }
};

// Ruta para borrar lógicamente un usuario
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;
  const authenticatedUserId = req.session.user;

  try {
    const authenticatedUser = await User.findById(authenticatedUserId);

    // Verificar la contraseña del usuario autenticado
    const isMatch = await bcrypt.compare(password, authenticatedUser.password);
    if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

    // Verificar si es el último Super Admin
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

    // Limpiar la sesión si el usuario se auto-elimina
    if (userId === authenticatedUserId) {
      req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Error al destruir la sesión' });
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
};

// Rutas de actualización de perfil (Info, Contacto, Password)
exports.updateUserInfo = async (req, res) => {
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
};

exports.updateUserContact = async (req, res) => {
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
};

exports.updateUserPassword = async (req, res) => {
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
};

// Ruta para obtener datos del perfil del usuario autenticado (Spotify)
exports.getSpotifyProfile = async (req, res) => {
  try {
    const me = await spotifyApi.getMe();
    res.json(me.body);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};