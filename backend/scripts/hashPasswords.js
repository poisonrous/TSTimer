const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado.');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

const hashExistingPasswords = async () => {
  await connectDB();

  try {
    const users = await User.find({});

    for (let user of users) {
      if (user.password && !user.password.startsWith('$2b$')) { // Verifica si la contraseña ya está cifrada
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        console.log(`Contraseña actualizada para el usuario: ${user.username}`);
      }
    }

    console.log('Todas las contraseñas existentes han sido actualizadas.');
    process.exit(0);
  } catch (error) {
    console.error('Error al actualizar las contraseñas:', error);
    process.exit(1);
  }
};

hashExistingPasswords();
