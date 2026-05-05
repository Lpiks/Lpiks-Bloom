const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  track: {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    artwork: String,
    trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' }
  },
  timestamp: { type: Date, default: Date.now },
  vibe: { type: String, default: 'Chill' }, // Chill, Cyberpunk, Ghibli, etc.
  moodIcon: { type: String, default: 'music' }
});

module.exports = mongoose.model('Diary', diarySchema);
