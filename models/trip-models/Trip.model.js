const { Schema, model } = require("mongoose");

const tripSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: [
      {
        type: Schema.Types.ObjectId,
        ref: "Day",
      },
    ],
    order: [String], // Array to store the order of day IDs
  },
  { timestamps: true } // Add the timestamps option
);

const Trip = model("Trip", tripSchema);

module.exports = Trip;
