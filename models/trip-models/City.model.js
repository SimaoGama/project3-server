const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const citySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }
});

const City = model('City', citySchema);
module.exports = City;
