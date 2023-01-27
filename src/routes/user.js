const express = require("express");
const { UserController } = require("../controller/user");
const { protect } = require("../middleware/auth");
const { upload } = require("../middleware/cloudinary");

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/verif", UserController.otp);
router.get("/profile", protect, UserController.profile);
router.get("/all", UserController.getAll);
router.put("/update", upload, UserController.updateUserProfile);

module.exports = router;
