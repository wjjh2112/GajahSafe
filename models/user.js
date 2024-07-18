const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: String,
  email: String,
  password: String,
  usertype: String
});

module.exports = mongoose.model('User', userSchema);
