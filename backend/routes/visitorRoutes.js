const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

// Registrar la visita de un usuario
router.post('/', async (req, res) => {
  try {
    const { userIP, source, duration } = req.body;

    const visitor = new Visitor({
      userIP,
      source,
      duration
    });

    await visitor.save();

    res.json(visitor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
