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

//create a new trip
router.post("/trips/new", async (req, res, next) => {
  const { destination, startDate, endDate } = req.body;
  const { userId } = req.body; // Retrieve the user ID from the request body

  if (endDate <= startDate) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "End date must be after start date" });
  }

  try {
    const newTrip = await Trip.create({
      userId,
      destination,
      startDate,
      endDate,
      days: [],
      order: [], //order to
    });

    res.json(newTrip);
  } catch (err) {
    console.log("An error occurred creating a new trip", err);
    next(err);
  }
});

//create new day
router.post("/day", async (req, res, next) => {
  const { tripId, date, city } = req.body;

  try {
    // Fetch accommodation data from API
    const accommodationResponse = await axios.get("API_LINK");
    const accommodationData = accommodationResponse.data;

    // Fetch restaurants data from API
    const restaurantsResponse = await axios.get(
      "https://travel-advisor.p.rapidapi.com/restaurants/list-in-boundary"
    ); // need to fetch bl/tr lng and lat to get the exact place and extract the info
    const restaurantsData = restaurantsResponse.data;

    // Create accommodation document
    const newAccommodation = await Accommodation.create({
      name: accommodationData.name,
      location: accommodationData.location,
      address: accommodationData.address,
      phone: accommodationData.phone,
      rating: accommodationData.rating,
      reviews: accommodationData.reviews,
      photos: accommodationData.photos,
    });

    // Create restaurants documents
    const newRestaurants = await Promise.all(
      restaurantsData.map(async (restaurantData) => {
        const newRestaurant = await Restaurant.create({
          name: restaurantData.name,
          location: restaurantData.location,
          address: restaurantData.address,
          phone: restaurantData.phone,
          rating: restaurantData.rating,
          reviews: restaurantData.reviews,
          photos: restaurantData.photos,
        });

        return newRestaurant;
      })
    );

    // Create day document with fetched data
    const newDay = await Day.create({
      date,
      city,
      accommodation: newAccommodation._id,
      restaurants: newRestaurants.map((restaurant) => restaurant._id),
      plans: [],
    });

    // Update the trip's days array and save the trip
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { $push: { days: newDay._id } },
      { new: true }
    );

    res.json(updatedTrip);
  } catch (err) {
    console.log("An error occurred creating a new day", err);
    next(err);
  }
});

// Retrieves all trips for the user
router.get("/trips", async (req, res, next) => {
  const { userId } = req.query;
  try {
    const userTrips = await Trip.find({ userId }).populate("days");

    console.log(`USER TRIPS: ${JSON.stringify(userTrips)}`);
    res.json(userTrips);
  } catch (err) {
    console.log("An error occurred while getting the trips", err);
    next(err);
  }
});

// Retrieves a specific trip by ID
router.get("/trip/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const trip = await Trip.findById(id).populate("days");

    if (!trip) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    console.log("An error occurred while retrieving the trip", err);
    next(err);
  }
});

router.put("/trip/:id", async (req, res, next) => {
  const { id } = req.params;
  const { destination, startDate, endDate, days, order } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Specified id is not valid" });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      {
        destination,
        startDate,
        endDate,
        days,
        order,
      },
      { new: true }
    ).populate("days");

    if (!updatedTrip) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No trip found with the specified id" });
    }

    res.json(updatedTrip);
  } catch (err) {
    console.log("An error occurred while updating the trip", err);
    next(err);
  }
});

router.delete("/trip/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check if ID is a valid mongoose ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Specified id is not valid" });
    }

    await Trip.findByIdAndDelete(id);
    res.json({ message: `Trip with id ${id} was deleted successfully` });
  } catch (err) {
    console.log("An error occurred while deleting the trip", err);
    next(err);
  }
});

//route that receives the image/file, sends it to cloudinary and returns a URL
// router.post('/upload', fileUploader.single('file'), (req, res, next) => {
//   try {
//     res.json({ fileUrl: req.file.path });
//   } catch (error) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: 'An error occurred uploading the file' });
//     next(error);
//   }
// });

module.exports = router;
