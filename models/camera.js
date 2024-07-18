const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cameraSchema = new Schema({
  cam_id: String,
  camName: String,
  camLocation: String,
  camLat: Number,
  camLong: Number,
  camStat: String
});

module.exports = mongoose.model('Camera', cameraSchema);
