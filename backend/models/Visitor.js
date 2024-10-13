const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  userIP: {
    type: String,
    required: true
  },
  source: {
    type: String
  },
  visitedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number // En segundos
  },
  playlistsCreated: {
    type: Number,
    default: 0
  },
  playlistsSaved: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
