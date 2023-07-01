const { Schema, model } = require('mongoose');

const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
  // Add other fields specific to a trip
});

const Trip = model('Trip', tripSchema);

module.exports = Trip;
