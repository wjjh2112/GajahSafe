const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Camera = require('../models/camera');

// Endpoint to fetch all cameras
router.get('/', (req, res) => {
  Camera.find({}, (err, cameras) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(cameras);
  });
});

module.exports = router;
