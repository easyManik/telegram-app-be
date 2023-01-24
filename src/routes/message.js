const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.js");
const { create, getMessage, deleteMessage } = require("../controller/message");

router
  .post("/add", protect, create)
  .get("/:receiver_id", protect, getMessage)
  .delete("/:id", protect, deleteMessage);

module.exports = router;
