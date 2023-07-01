const router = require('express').Router();

const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const saltRounds = 10;

router.get('/', (req, res) => {
  console.log('hello');
  res.json('Hello auth');
});

module.exports = router;
