const mongoose = require('mongoose');
const { Schema } = mongoose;

const planSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }
});

const Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;
