const router = require("express").Router();
const mongoose = require("mongoose");
const StatusCodes = require("http-status-codes").StatusCodes;
// const fileUploader = require('../config/cloudinary.config');

//importing the models
const User = require("../models/User.model");
const Trip = require("../models/trip-models/Trip.model");
const Day = require("../models/trip-models/Day.model");
const Accommodation = require("../models/trip-models/Accommodation.model");
const Restaurant = require("../models/trip-models/Restaurant.model");
const Plan = require("../models/trip-models/Plan.model");
const City = require("../models/trip-models/City.model");
const Location = require("../models/trip-models/Location.model");

router.put("/day/:dayId", async (req, res, next) => {
  const { dayId } = req.params;
  const updatedDayData = req.body;

  try {
    const selectedPlace = updatedDayData.selectedPlace;
    if (!selectedPlace) {
      return res
        .status(400)
        .json({ error: "Selected place data not provided" });
    }

    const { type } = selectedPlace.category.key;

    // Find the day by ID
    const day = await Day.findById(dayId);

    if (!day) {
      return res.status(404).json({ error: "Day not found" });
    }

    // Check the type of the selected place
    if (type === "restaurant") {
      // If the selected place is a restaurant, update the 'restaurants' array in the day object
      const { city, location, ...restaurantData } = selectedPlace;
      const updatedRestaurant = await Restaurant.create(restaurantData);
      day.restaurants.push(updatedRestaurant._id);
    } else if (type === "hotel") {
      // If the selected place is a hotel, update the 'accommodation' field in the day object
      const { city, location, ...accommodationData } = selectedPlace;
      const updatedAccommodation = await Accommodation.create(
        accommodationData
      );
      day.accommodation = updatedAccommodation._id;
    } else {
      // Handle other types if needed
      return res.status(400).json({ error: "Invalid place type" });
    }

    // Save the updated day
    const updatedDay = await day.save();

    res.json(updatedDay);
  } catch (error) {
    console.error("Error updating day:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
