const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const imageSchema = new Schema({
  width: { type: String, required: true },
  height: { type: String, required: true },
  url: { type: String, required: true },
});

const planSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  description: { type: String },
  ranking: { type: String },
  photo: {
    large: imageSchema,
    medium: imageSchema,
    original: imageSchema,
    small: imageSchema,
    thumbnail: imageSchema,
  },
  location: { type: Schema.Types.ObjectId, ref: "Location" },
});

const Plan = model("Plan", planSchema);
module.exports = Plan;

//too complex, add later! :D
