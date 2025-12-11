const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const logVisit = require('../middleware/logVisit'); // Middleware de registro

// Registrar inicio de visita
router.post('/log-visit', logVisit, visitController.logVisitResponse);

// Terminar visita (actualizar duración)
router.post('/end-visit', visitController.endVisit);

// Obtener estadísticas para el dashboard
router.get('/stats', visitController.getStats);

module.exports = router;