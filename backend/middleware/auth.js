const bcrypt = require('bcrypt');
const User = require('../models/User');

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Verificar si la cuenta está eliminada
    if (user.deletedAt) {
      return res.status(403).json({ error: 'Account has been deleted' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    req.session.user = user._id;
    req.session.access = user.access;

    res.status(200).json({ message: 'Login successful', access: user.access });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = login;
