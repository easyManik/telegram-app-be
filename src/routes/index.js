const express = require("express");
const router = express.Router();
const messageRoute = require("./message");
const users = require("./user");

router.use("/users", users).use("/message", messageRoute);
module.exports = router;
