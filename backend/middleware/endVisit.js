const Visit = require('../models/Visit');

async function endVisit(req, res, next) {
  if (req.session.visitId) {
    const visitEnd = Date.now();
    const visitDuration = (visitEnd - req.session.visitStart) / 1000; // Duración en segundos
    try {
      await Visit.findByIdAndUpdate(req.session.visitId, { duration: visitDuration });
      console.log('Duración de la visita actualizada:', visitDuration, 'segundos');
    } catch (err) {
      console.error('Error al actualizar la duración de la visita:', err);
    }
  }
  next();
}

module.exports = endVisit;
