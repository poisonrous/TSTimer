const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  visible: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('FAQ', faqSchema);
