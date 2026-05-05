const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

/**
 * @route   POST /api/favorites/toggle
 * @desc    Toggle favorite status for any item type
 */
router.post('/toggle', async (req, res) => {
  const { type, itemId, metadata } = req.body;

  try {
    const existing = await Favorite.findOne({ type, itemId });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ status: 'removed', type, itemId });
    }

    const newFavorite = new Favorite({
      type,
      itemId,
      metadata
    });

    await newFavorite.save();
    res.json({ status: 'added', type, itemId, favorite: newFavorite });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

/**
 * @route   GET /api/favorites/:type
 * @desc    Get all favorites of a specific type
 */
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const favorites = await Favorite.find({ type }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

/**
 * @route   GET /api/favorites/check/:type/:itemId
 * @desc    Check if a specific item is favorited
 */
router.get('/check/:type/:itemId', async (req, res) => {
  const { type, itemId } = req.params;
  try {
    const favorite = await Favorite.findOne({ type, itemId });
    res.json({ isFavorited: !!favorite });
  } catch (err) {
    res.json({ isFavorited: false });
  }
});

module.exports = router;
