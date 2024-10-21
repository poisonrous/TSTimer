const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  ip: String,
  source: String,
  timestamp: { type: Date, default: Date.now },
  duration: Number
});

module.exports = mongoose.model('Visit', visitSchema);
