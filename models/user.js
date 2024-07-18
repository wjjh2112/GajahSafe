const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user_id: String,
  fullname: String,
  email: String,
  password: String,
  usertype: String
});

module.exports = mongoose.model('User', userSchema);
