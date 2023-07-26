const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  addUser,
  signInUser,
  signOutUser,
  verifyToken,
  getUser,
  uploadImage,
} = require("../controller/userController");

const router = express.Router();

// signup
router.post("/signup", addUser);

// signin
router.post("/signin", signInUser);

// signout
router.post("/signout", verifyToken, signOutUser);

//  check user
router.get("/user", verifyToken, getUser);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
