const jwt = require('jsonwebtoken');

//function to generate token like access and refresh token
const generateToken=(payload, key, expiry)=>{
  return jwt.sign(payload,key, {expiresIn: expiry});
}

module.exports = {
  generateToken
}