const FAQ = require('../models/Faq');

// Ruta para obtener todas las preguntas visibles
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ deletedAt: null });
    res.status(200).json(faqs);
  } catch (error) {
    console.error('Error al obtener las preguntas:', error);
    res.status(500).json({ error: 'Error al obtener las preguntas' });
  }
};

// Crear una nueva pregunta
exports.createFaq = async (req, res) => {
  try {
    const newFAQ = new FAQ(req.body);
    const savedFAQ = await newFAQ.save();
    res.status(201).json(savedFAQ);
  } catch (error) {
    console.error('Error al crear la pregunta:', error);
    res.status(500).json({ error: 'Error al crear la pregunta' });
  }
};

// Actualizar una pregunta
exports.updateFaq = async (req, res) => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedFAQ);
  } catch (error) {
    console.error('Error al actualizar la pregunta:', error);
    res.status(500).json({ error: 'Error al actualizar la pregunta' });
  }
};

// Cambiar visibilidad de una pregunta
exports.toggleFaqVisibility = async (req, res) => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(
        req.params.id,
        { visible: req.body.visible },
        { new: true }
    );
    res.status(200).json(updatedFAQ);
  } catch (error) {
    console.error('Error al cambiar la visibilidad de la pregunta:', error);
    res.status(500).json({ error: 'Error al cambiar la visibilidad de la pregunta' });
  }
};

// Eliminar una pregunta (eliminación lógica)
exports.deleteFaq = async (req, res) => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(
        req.params.id,
        { deletedAt: new Date() },
        { new: true }
    );
    res.status(200).json(updatedFAQ);
  } catch (error) {
    console.error('Error al eliminar la pregunta:', error);
    res.status(500).json({ error: 'Error al eliminar la pregunta' });
  }
};