const express = require('express');
const router = express.Router();
const Diary = require('../../models/Diary');
const { toSentenceCase } = require('../middleware/mouloudia');

// Log a new track play
router.post('/log', async (req, res) => {
  try {
    const { title, artist, artwork, vibe } = req.body;
    
    const newEntry = new Diary({
      track: {
        title: toSentenceCase(title),
        artist: toSentenceCase(artist),
        artwork
      },
      vibe: vibe || 'Chill'
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get diary history (Timeline)
router.get('/history', async (req, res) => {
  try {
    const history = await Diary.find().sort({ timestamp: -1 }).limit(50);
    
    // Group by date for the frontend SectionList
    const grouped = history.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {});

    const sections = Object.keys(grouped).map(date => ({
      title: date,
      data: grouped[date]
    }));

    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
