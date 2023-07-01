const { expressjwt: jwt } = require('express-jwt');

// instantiate the jwt token validation middleware

const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload', // we'll access the decoded jwt in req.payload
  getToken: getTokenFromHeaders // the function to extract the jwt
});

function getTokenFromHeaders(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    const token = req.headers.authorization.split(' ')[1];
    return token;
  }

  return null;
}

//export middleware to use in protected routes
module.exports = { isAuthenticated };
