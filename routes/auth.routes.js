const router = require('express').Router();

const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const saltRounds = 10;

const StatusCodes = require('http-status-codes').StatusCodes;

router.post('/signup', async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    //check if all parameters have been declared
    if (
      email === '' ||
      password === '' ||
      firstName === '' ||
      lastName === ''
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'All fields are mandatory' });
    }

    //use regex to validate email
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Provide a valid email address' });
    }

    //use regex to validate password
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Provide a valid password' });
    }

    //validate if email exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(StatusCodes.IM_A_TEAPOT) // :)
        .json({ message: 'Email already exists' });
    }

    //encrypting the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    //create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    res.json({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      _id: newUser._id
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (email === '' || password === '') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'All fields are mandatory' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Provided email is not registered' });
    }

    //check if password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (isPasswordCorrect) {
      //create an object that will be set as the JWT payload
      // DON'T SEND THE PASSWORD!
      const payload = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };

      //create and sign the JWT
      //we pass the user payload and the token secret defined in .env

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: 'HS256', // algo to encrypt the token, the default is HS256
        expiresIn: '6h' // TTL
      });
      //send the JWT as response
      res.json({ authToken });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.log('An error has occurred while logging in', error);
    next(error);
  }
});

//verify - used to check if the jwt stored on the client is valid
router.get('/verify', isAuthenticated, (req, res, next) => {
  //if the jwt is valid it gets decoded and made available in req.payload
  console.log('req.payload', req.payload);

  res.json(req.payload);
});

module.exports = router;
