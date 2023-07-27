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

router.get("/day/:dayId", async (req, res) => {
  const { dayId } = req.params;

  try {
    const day = await Day.findById(dayId)
      .populate("restaurants") // Populate the 'restaurants' field with data from the 'Restaurant' model
      .populate("accommodation") // Populate the 'accommodation' field with data from the 'Accommodation' model
      .populate("plans"); // Populate the 'plans' field with data from the 'Plan' model

    if (!day) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Day not found" });
    }

    res.json(day);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid day" });
  }
});

router.get("/day/:dayId/populated", async (req, res, next) => {
  const { dayId } = req.params;

  try {
    const day = await Day.findById(dayId).populate({
      path: [
        { path: "restaurants", model: "Restaurant" },
        { path: "accommodation", model: "Accommodation" },
        { path: "plans", model: "Plan" },
      ],
    });
    res.json(day);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid day" });
  }
});

router.put("/:dayId", async (req, res) => {
  const { dayId } = req.params;
  const selectedPlace = req.body.selectedPlace;

  console.log("dayID", dayId);
  // console.log("selectedPlace", selectedPlace);

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
    if ("price_level" in selectedPlace && "cuisine" in selectedPlace) {
      const newRestaurant = await Restaurant.create({
        name: selectedPlace.name,
        location: createdLocation._id,
        address: selectedPlace.address,
        phone: selectedPlace.phone,
        rating: selectedPlace.rating,
        reviews: selectedPlace.reviews,
        photos: selectedPlace.photos,
      });

      await Day.findByIdAndUpdate(day._id, {
        $push: {
          restaurants: newRestaurant._id,
        },
      });

      console.log("updatedRestaurant:", newRestaurant);
    } else if (
      "hotel_class" in selectedPlace &&
      "special_offers" in selectedPlace
    ) {
      const newAccommodation = await Accommodation.create({
        name: selectedPlace.name,
        location: createdLocation._id,
        classification: selectedPlace.hotel_class,
        rating: selectedPlace.rating,
        reviews: selectedPlace.reviews,
        photos: selectedPlace.photos,
      });

      await Day.findByIdAndUpdate(day._id, {
        accommodation: newAccommodation._id,
      });
      console.log("updatedAccommodation:", newAccommodation);
    } else if (selectedPlace.category.key === "attraction") {
      const newPlan = await Plan.create({
        name: selectedPlace.name,
        description: selectedPlace.caption || "",
        location: createdLocation._id,
        address: selectedPlace.address,
        phone: selectedPlace.phone,
        ranking: selectedPlace.helpful_votes,
        photo: {
          images: {
            large: {
              width: selectedPlace.photo?.images?.large?.width || "0",
              height: selectedPlace.photo?.images?.large?.height || "0",
              url: selectedPlace.photo?.images?.large?.url || "",
            },
            medium: {
              width: selectedPlace.photo?.images?.medium?.width || "0",
              height: selectedPlace.photo?.images?.medium?.height || "0",
              url: selectedPlace.photo?.images?.medium?.url || "",
            },
            original: {
              width: selectedPlace.photo?.images?.original?.width || "0",
              height: selectedPlace.photo?.images?.original?.height || "0",
              url: selectedPlace.photo?.images?.original?.url || "",
            },
            small: {
              width: selectedPlace.photo?.images?.small?.width || "0",
              height: selectedPlace.photo?.images?.small?.height || "0",
              url: selectedPlace.photo?.images?.small?.url || "",
            },
            thumbnail: {
              width: selectedPlace.photo?.images?.thumbnail?.width || "0",
              height: selectedPlace.photo?.images?.thumbnail?.height || "0",
              url: selectedPlace.photo?.images?.thumbnail?.url || "",
            },
          },
        },
      });

      await Day.findByIdAndUpdate(day._id, {
        $push: {
          plans: newPlan._id,
        },
      });
      console.log("updatedPlan:", newPlan);
    } else {
      // Handle other types if needed
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid place type" });
    }

    // Save the updated day
    const updatedDay = await day.save();
    console.log("BE updatedDay:", updatedDay);

    res.json(updatedDay);
  } catch (error) {
    if (error.message === "Invalid place type") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid place type" });
    }
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

// GET plan by ID
router.get("/plan/:planId", async (req, res) => {
  const { planId } = req.params;

  try {
    const plan = await Plan.findById(planId);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch plan data." });
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

// DELETE restaurant by ID
router.delete("/restaurant/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurantId);
    if (!deletedRestaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Remove the restaurant from all days where it is referenced
    await Day.updateMany(
      { restaurants: restaurantId },
      { $pull: { restaurants: restaurantId } }
    );

    res.json({ message: "Restaurant deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Unable to delete restaurant." });
  }
});

// DELETE plan by ID
router.delete("/plan/:planId", async (req, res) => {
  const { planId } = req.params;

  try {
    const deletedPlan = await Plan.findByIdAndDelete(planId);
    if (!deletedPlan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    // Remove the plan from all days where it is referenced
    await Day.updateMany({ plans: planId }, { $pull: { plans: planId } });

    res.json({ message: "Plan deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Unable to delete Plan." });
  }
});

// DELETE accommodation by ID
router.delete("/accommodation/:accommodationId", async (req, res) => {
  const { accommodationId } = req.params;

  try {
    const deletedAccommodation = await Accommodation.findByIdAndDelete(
      accommodationId
    );
    if (!deletedAccommodation) {
      return res.status(404).json({ error: "Accommodation not found." });
    }

    // Remove the accommodation from all days where it is referenced
    await Day.updateMany(
      { accommodation: accommodationId },
      { $unset: { accommodation: 1 } }
    );

    res.json({ message: "Accommodation deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Unable to delete accommodation." });
  }
});

module.exports = router;
