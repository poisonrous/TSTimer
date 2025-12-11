const Visit = require('../models/Visit');
const Playlist = require('../models/Playlist');

// Ruta para registrar visitas
exports.logVisitResponse = (req, res) => {
  res.status(200).json({ message: 'Visita registrada con éxito' });
};

// Ruta para terminar visita
exports.endVisit = async (req, res) => {
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
};

// Ruta para obtener estadísticas
exports.getStats = async (req, res) => {
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
};