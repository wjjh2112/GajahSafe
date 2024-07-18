const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ElectricFence = require('../models/electricFence');

// Endpoint to fetch all electric fences
router.get('/', (req, res) => {
  ElectricFence.find({}, (err, electricFences) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(electricFences);
  });
});

module.exports = router;
