const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  region: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  currency: { type: String },
  language: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Destination = mongoose.model('Destination', destinationSchema);
module.exports = Destination;