const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');

// Endpoint to fetch all users
router.get('/', (req, res) => {
  User.find({}, 'fullname email usertype', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(users);
  });
});

module.exports = router;
