const mongoose = require('mongoose');
const { Schema } = mongoose;

const daySchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City'
  },
  //accommodation: not an array, only 1 accommodation per day
  accommodation: {
    type: Schema.Types.ObjectId,
    ref: 'Accommodation'
  },
  //restaurants: an array because a day may include more than 1 meal
  restaurants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
  ],
  //probably attractions and plans for the day
  plans: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Plan'
    }
  ]
});

const Day = model('Day', daySchema);
module.exports = Day;
