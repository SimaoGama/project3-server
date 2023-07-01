const mongoose = require('mongoose');
const { Schema } = mongoose;

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

const City = mongoose.model('City', citySchema);
module.exports = City;
