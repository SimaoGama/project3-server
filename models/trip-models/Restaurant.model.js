const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  },
  address: {
    type: String,
    required: true
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

const Restaurant = model('Restaurant', restaurantSchema);
module.exports = Restaurant;
