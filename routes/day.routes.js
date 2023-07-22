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

router.put("/:dayId", async (req, res) => {
  const { dayId } = req.params;
  const selectedPlace = req.body.selectedPlace;

  try {
    // Find the day by ID
    const day = await Day.findById(dayId);

    if (!day) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Day not found" });
    }

    const newLocation = new Location({
      lat: selectedPlace.latitude,
      lng: selectedPlace.longitude,
    });
    const createdLocation = await newLocation.save();

    // Check the type of the selected place
    if (selectedPlace.category.key === "restaurant") {
      const newRestaurant = new Restaurant({
        name: selectedPlace.name,
        location: createdLocation._id,
        address: selectedPlace.address,
        phone: selectedPlace.phone,
        rating: selectedPlace.rating,
        reviews: selectedPlace.reviews,
        photos: selectedPlace.photos,
      });

      day.restaurants.push(newRestaurant);
    } else if (selectedPlace.category.key === "hotel") {
      const newAccommodation = new Accommodation({
        name: selectedPlace.name,
        location: createdLocation._id,
        address: selectedPlace.address,
        phone: selectedPlace.phone,
        rating: selectedPlace.rating,
        reviews: selectedPlace.reviews,
        photos: selectedPlace.photos,
      });

      day.accommodation = newAccommodation;
    } else {
      // Handle other types if needed
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid place type" });
    }

    // Save the updated day
    const updatedDay = await day.save();
    console.log(updatedDay);

    res.json(updatedDay);
  } catch (error) {
    console.error("Error updating day:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET restaurant by ID
router.get("/restaurant/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch restaurant data." });
  }
});

// GET accommodation by ID
router.get("/accommodation/:accommodationId", async (req, res) => {
  const { accommodationId } = req.params;

  try {
    const accommodation = await Accommodation.findById(accommodationId);
    res.json(accommodation);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch accommodation data." });
  }
});

module.exports = router;
