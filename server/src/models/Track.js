const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  duration: { type: Number },
  category: { type: String },
  sovereignMetadata: {
    syncedLyrics: { type: String },
    plainLyrics: { type: String },
    userTags: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('Track', trackSchema);
