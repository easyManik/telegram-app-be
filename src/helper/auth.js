const jwt = require("jsonwebtoken");
const key = process.env.JWT_KEY;

const generateToken = (payload) => {
  const verifyOtp = {
    expiresIn: "1h",
  };
  const token = jwt.sign(payload, key, verifyOtp);
  return token;
};

const generateRefreshToken = (payload) => {
  const verifyOpts = {
    expiresIn: "1 day",
  };
  const token = jwt.sign(payload, key, verifyOpts);
  return token;
};

module.exports = { generateToken, generateRefreshToken };
