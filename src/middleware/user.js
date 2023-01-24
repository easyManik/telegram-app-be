const { verify } = require("../helper/jwt");
const response = require("../helper/common");
const createError = require("http-errors");

module.exports.user = async (req, res, next) => {
  try {
    console.log("header middleware user", req.headers);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      let token = req.headers.authorization.split(" ")[1];
      console.log("token", token);
      const payload = await verify(token);
      console.log("payload", payload);
      req.payload = payload;
      next();
    } else {
      response(res, [], 200, "SERVER NEED TOKEN");
    }
  } catch (error) {
    if (error && error.name === "JsonWebTokenError") {
      next(createError(400, "token invalid"));
    } else if (error && error.name === "TokenExpiredError") {
      next(createError(400, "token expired"));
    } else {
      next(createError(400, "Token not active"));
    }
  }
};
