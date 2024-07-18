const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email, password }, 'fullname email usertype', (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({
      name: user.fullname,
      email: user.email,
      avatar: 'images/icon/avatar-01.jpg', // Example static avatar path
      usertype: user.usertype
    });
  });
});

module.exports = router;
