const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

module.exports = router;
