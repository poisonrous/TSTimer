const Visit = require('../models/Visit');

async function logVisit(req, res, next) {
  try {
    if (!req.session.visitId) { // Verifica si visitId está definido en la sesión
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const source = req.headers['referer'] || 'Direct';
      const newVisit = new Visit({
        ip,
        source,
        timestamp: new Date(),
        duration: 0 // Se actualizará al final de la sesión
      });

      // Intentar guardar la visita
      const savedVisit = await newVisit.save();
      req.session.visitId = savedVisit._id; // Guarda el ID de la visita en la sesión
      req.session.visitStart = Date.now(); // Guarda el inicio de la visita
      console.log('Visita registrada con éxito:', savedVisit);
      res.status(200).json({ message: 'Visita registrada con éxito', visitId: savedVisit._id });
    } else {
      console.log('Visita ya registrada en esta sesión:', req.session.visitId);
      next(); // Continúa con la siguiente función middleware
    }
  } catch (err) {
    console.error('Error al guardar la visita:', err);
    res.status(500).json({ message: 'Error al guardar la visita', error: err });
  }
}

module.exports = logVisit;
