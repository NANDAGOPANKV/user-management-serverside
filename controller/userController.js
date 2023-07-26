const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const addUser = async (req, res) => {
  const { name, email, password } = req.body;
  let newUser;

  // is user already exists
  const userAlreadyExists = await User.findOne({ email: email });

  const hashedPassword = bcrypt.hashSync(password);

  if (!userAlreadyExists) {
    newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });

    try {
      newUser = await newUser.save();
      return res.status(200).json({ message: "Successfully Account Created" });
    } catch (err) {
      return res.status(404).json({ message: "Internal Error Try Again" });
    }
  } else {
    return res.status(409).json({ message: "Account Already Exists" });
  }
};

const signInUser = async (req, res) => {
  const { email, password } = req?.body;
  let user;

  try {
    user = await User?.findOne({ email: email });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while querying the database." });
  }

  if (!user) {
    return res.status(401).json({ message: "Invalid Email or Password" });
  }

  try {
    const reHashedPassword = await bcrypt.compare(password, user.password);

    if (!reHashedPassword) {
      return res.status(401).json({ message: "Invalid Email or Password 2" });
    }

    const token = jwt.sign({ id: user._id }, process.env.jwt_key, {
      expiresIn: "1hr", // Set token expiration to one day (adjust as needed)
    });

    res.cookie("token", token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 3600),
      httpOnly: true,
      sameSite: "lax",
    });

    const userData = {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      image: user?.profileImage,
    };

    return res.status(200).json({ user: userData, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred during password comparison." });
  }
};

// sign out user
const signOutUser = async (req, res) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies?.split("=")[1];

  if (!prevToken) {
    return res.status(400).json({ message: "Can't find token" });
  }

  jwt.verify(String(prevToken), process.env.jwt_key, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Verification Failed" });
    }

    // Clear the cookie on the client-side by setting max-age to 0
    // res.setHeader("Set-Cookie", `${user.id}=; max-age=0`);
    res.clearCookie(`${user?.id}`);
    req.cookies[`${user?.id}`] = "";

    return res.status(200).json({ message: "Successfully Signed Out" });
  });
};

// verify token
const verifyToken = async (req, res, next) => {
  const cookies = req.headers.cookie;
  const token = cookies?.split("=")[1];

  if (!token) {
    return res.status(404).json({ message: "No Token Found" });
  }
  jwt.verify(String(token), process.env.jwt_key, (err, user) => {
    if (err) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    // print user id if you wanted
    req.id = user.id;
  });
  next();
};

let userId;
// get user
const getUser = async (req, res) => {
  userId = req.id;

  let user;

  try {
    user = await User.findById(userId);
    console.log(user);
  } catch (error) {
    return new Error(error);
  }

  if (!user) {
    return res.status(404).json({ message: "User Not There" });
  }

  return res.status(200).json({ user });
};

// upload image
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const imagePath = req.file.filename;
  const userId = req.body.uid;

  const userData = User.findById(userId);

  let userUpdator = await User.findByIdAndUpdate(userId, {
    name: userData?.name,
    email: userData?.email,
    password: userData?.password,
    profileImage: imagePath,
  });

  let done = await userUpdator.save();
  console.log(done);

  res.status(200).json({ message: "Image uploaded successfully" });
};

module.exports = {
  addUser,
  signInUser,
  signOutUser,
  verifyToken,
  getUser,
  uploadImage,
};
