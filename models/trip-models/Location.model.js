const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

// schema to have the lat and lng of the google maps places api
const locationSchema = new Schema({
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
});

const Location = model("Location", locationSchema);

module.exports = Location;
