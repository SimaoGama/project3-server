const mongoose = require('mongoose');
const { Schema } = mongoose;

// schema to have the lat and lng of the google maps places api
const locationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
