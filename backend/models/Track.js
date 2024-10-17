const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  src: {
    type: String
  },
  preview_url: {
    type: String
  },
  spotifyId: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('Track', TrackSchema);
