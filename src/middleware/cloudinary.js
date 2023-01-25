const multer = require("multer");
const { storage } = require("../config/cloudinary");

const upload = multer({
  storage: storage,
}).fields([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "video",
    maxCount: 1,
  },
]);

module.exports = { upload };
