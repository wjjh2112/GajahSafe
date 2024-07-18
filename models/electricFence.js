const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const electricFenceSchema = new Schema({
  ef_id: String,
  efName: String,
  efLocation: String,
  efLat: Number,
  efLong: Number,
  efStat: String
});

module.exports = mongoose.model('ElectricFence', electricFenceSchema);
