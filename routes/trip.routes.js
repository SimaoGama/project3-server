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
  const { userId } = req.body;

  if (endDate <= startDate) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "End date must be after start date" });
  }

  const getTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return totalDays;
  };

  try {
    const newTrip = await Trip.create({
      userId,
      // imageUrl,
      destination,
      startDate,
      endDate,
      days: [],
      order: [],
    });

    const totalDays = getTotalDays(new Date(startDate), new Date(endDate));

    const createdDays = await Promise.all(
      Array.from({ length: totalDays + 1 }).map((_, index) =>
        Day.create({
          date: new Date(
            new Date(startDate).getTime() + index * 24 * 60 * 60 * 1000
          ),
          city: null,
          accommodation: null,
          restaurants: [],
          plans: [],
        })
      )
    );

    // Add the created day IDs to the trip's "days" array
    const dayIds = createdDays.map((day) => day._id);
    newTrip.days = dayIds;

    // Update the trip with the day order
    newTrip.order = dayIds.map((dayId) => dayId.toString());

    // Save the updated trip
    await newTrip.save();

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

    res.json(userTrips);
  } catch (err) {
    console.log("An error occurred while getting the trips", err);
    next(err);
  }
});

// Retrieves a specific trip by ID
router.get("/trip/:tripId", async (req, res, next) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).populate("days");

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
  const { destination, startDate, endDate, order } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Specified id is not valid" });
    }

    // Fetch the current trip from the database
    const trip = await Trip.findById(id).populate("days");

    if (!trip) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No trip found with the specified id" });
    }

    // Check if startDate or endDate have changed
    const startDateChanged = startDate && startDate !== trip.startDate;
    const endDateChanged = endDate && endDate !== trip.endDate;

    // Update the trip properties
    trip.destination = destination;
    trip.startDate = startDate;
    trip.endDate = endDate;
    trip.order = order;

    // Calculate the new number of days
    const totalDays = getTotalDays(new Date(startDate), new Date(endDate));

    // Initialize trip.days as an empty array if it is undefined
    trip.days = trip.days || [];

    // Update the days array if startDate or endDate have changed
    if (startDateChanged || endDateChanged) {
      // Remove excess days outside the new range
      trip.days = trip.days.filter((day) => {
        const dayDate = new Date(day.date);
        return dayDate >= new Date(startDate) && dayDate <= new Date(endDate);
      });

      // Add new days within the range if necessary
      const numExistingDays = trip.days.length;

      // Create a temporary array to store the new days
      const newDays = [];

      // Add new days before the existing days
      const start = new Date(startDate);
      for (let i = 0; i < numExistingDays; i++) {
        const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        newDays.push(date);
      }

      // Add new days within the range
      for (let i = numExistingDays; i < totalDays; i++) {
        const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        newDays.push(date);
      }

      // Clear the trip.days array
      trip.days = [];

      // Add the new days to the trip.days array
      for (let i = 0; i < newDays.length; i++) {
        const date = newDays[i];

        const day = await Day.create({
          date,
          city: null,
          accommodation: null,
          restaurants: [],
          plans: [],
        });

        trip.days.push(day);
      }
    }

    // Save the updated trip
    const updatedTrip = await trip.save();

    res.json(updatedTrip);
  } catch (err) {
    console.log("An error occurred while updating the trip", err);
    next(err);
  }
});

const getTotalDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return totalDays + 1;
};

router.delete("/trips/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check if ID is a valid mongoose ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Specified id is not valid" });
    }

    // Delete the trip
    const deletedTrip = await Trip.findByIdAndDelete(id);

    if (!deletedTrip) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Trip not found" });
    }

    // Delete the associated days
    await Day.deleteMany({ _id: { $in: deletedTrip.days } });

    res.json({
      message: `Trip with id ${id} and associated days were deleted successfully`,
    });
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

// Controller function to update a specific day by ID
router.put("/day/:dayId", async (req, res, next) => {
  const { dayId } = req.params;
  const updatedDay = req.body;

  try {
    // Find the day by ID and update it with the provided data
    const updatedDayData = await Day.findByIdAndUpdate(dayId, updatedDay, {
      new: true, // Return the updated document
    });

    if (!updatedDayData) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Day not found" });
    }

    // Day updated successfully
    res.json(updatedDayData);
  } catch (error) {
    console.error("Error updating day:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
});

module.exports = router;
