const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

router.get('/faqs', faqController.getFaqs);
router.post('/faqs', faqController.createFaq);
router.put('/faqs/:id', faqController.updateFaq);
router.patch('/faqs/:id/visibility', faqController.toggleFaqVisibility);
router.put('/faqs/:id/delete', faqController.deleteFaq); // Borrado lógico

module.exports = router;