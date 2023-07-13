// const router = require("express").Router();
// const User = require("../models/User.model");
// const mongoose = require("mongoose");
// const StatusCodes = require("http-status-codes").StatusCodes;

// router.get("/user/:userId", async (req, res, next) => {
//   const { userId } = req.params; // Get the user ID from the request, you may use req.user if you have authentication middleware
//   try {
//     const user = await User.findById(userId).populate("trips");
//     res.json(user);
//   } catch (error) {
//     console.log("An error occurred while fetching the user", error);
//     next(error);
//   }
// });

// module.exports = router;
