const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'Playlist generated by TSTimer.'
  },
  tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    }
  ],
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  requestedDuration: {
    type: Number, // En segundos
    required: true
  },
  actualDuration: {
    type: Number // En segundos
  }
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
