const Visit = require('../models/Visit');
const geoip = require('geoip-lite');

async function logVisit(req, res, next) {
  if (!req.session.visitId) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'Unknown';
    const source = req.headers['referer'] || 'Direct';

    const newVisit = new Visit({
      ip,
      country, // Almacenar la información del país
      source,
      timestamp: new Date(),
      duration: 0
    });

    try {
      const savedVisit = await newVisit.save();
      req.session.visitId = savedVisit._id;
      req.session.visitStart = Date.now();
      console.log('Visita registrada con éxito:', savedVisit._id);
      next(); // Continuar con la cadena de middleware
    } catch (err) {
      console.error('Error al guardar la visita:', err);
      res.status(500).json({ message: 'Error al guardar la visita', error: err });
    }
  } else {
    console.log('Visita ya registrada en esta sesión:', req.session.visitId);
    next(); // Continuar con la cadena de middleware
  }
}

module.exports = logVisit;
