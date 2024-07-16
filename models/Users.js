const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usertype: { type: String, required: true }
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
