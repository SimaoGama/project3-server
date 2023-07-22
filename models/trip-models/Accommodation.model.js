const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const accommodationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  },
  classification: {
    type: String
  },
  phone: {
    type: String
  },
  rating: {
    type: Number
  },
  reviews: {
    type: [String]
  },
  photos: {
    type: [String]
  }
});

const Accommodation = model('Accommodation', accommodationSchema);
module.exports = Accommodation;
