const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['track', 'album', 'playlist', 'artist'],
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  metadata: {
    title: String,
    artist: String,
    name: String, // For artists
    artwork: String,
    nb_tracks: Number,
    duration: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Unique constraint per type and itemId
FavoriteSchema.index({ type: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
