const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  event: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Diary', diarySchema);
