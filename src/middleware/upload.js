const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, "./upload");
    } else {
      cb(null, "./upload/video");
    }
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

// 100mb video 2mb  image
const maxSize = 200 * 1024 * 1024;
const middUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "video/mp4"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Uploaded file must be png, jpeg, jpg or mp4 file Only")
      );
    }
  },
  limits: { fileSize: maxSize },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

module.exports = middUpload;
