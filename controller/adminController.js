const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../model/adminModel");
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");

// get All users
const getAllUsrs = async (req, res) => {
  let users;
  try {
    users = await User.find();
    if (users) {
      return res.status(200).json({ users });
    } else {
      return res.status(204).json({ message: "No Data On The Database" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Internal Error Try After Sometime", error });
  }
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
// authentication
// signup
const adminSignUp = async (req, res) => {
  const { email, password, name } = req?.body;
  let admin;
  let hashedPassword = bcrypt.hashSync(password);
  let adminB = new Admin({
    email: email,
    password: hashedPassword,
    name: name,
  });
  try {
    admin = await adminB.save();
    if (admin) {
      return res.status(200).json({ message: "Successfylly Account Created" });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Internal Error Try After Sometime", error });
  }
};
// signin
const adminSignIn = async (req, res) => {
  const { email, password } = req?.body;
  let admin;

  try {
    admin = await Admin.findOne({ email: email });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while querying the database." });
  }

  if (!admin) {
    return res.status(401).json({ message: "Invalid Email " });
  }

  try {
    const reHashedPassword = await bcrypt.compareSync(
      password,
      admin?.password
    );

    if (!reHashedPassword) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.jwt_key, {
      expiresIn: "1hr",
    });

    res.cookie("adminToken", token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 1800),
      httpOnly: true,
      sameSite: "lax",
    });

    const adminData = {
      id: admin?._id,
      name: admin?.name,
      email: admin?.email,
    };

    return res.status(200).json({ admin: adminData, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred during password comparison." });
  }
};
// admin signout
const adminSignout = async (req, res) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies?.split("=")[1];

  if (!prevToken) {
    return res.status(400).json({ message: "Cant't Find Token" });
  }

  jwt.verify(String(prevToken), process.env.jwt_key, (err, admin) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Verification Failed" });
    }

    // clear the cookie
    res.clearCookie(`${admin?.id}`);
    req.cookies[`${admin?.id}`] = "";

    return res.status(200).json({ message: "Successfully Signed Out" });
  });
};

// edit users
const adminEditUsers = async (req, res) => {
  let user;
  let id = req.params.id;
  let { name, email } = req.body;

  try {
    let userData = await User.findById(id);
    let updateUserData = await User.findByIdAndUpdate(id, {
      name,
      email,
      password: userData?.password,
      profileImage: userData?.profileImage,
    });

    user = await updateUserData.save();
    // user = await
  } catch (error) {
    console.log(error);
  }

  if (!user) {
    return res
      .status(404)
      .json({ message: "Unable To Update The User With This Id" });
  }

  return res.status(200).json({ user });
};

// delete user
const adminDeleteUser = async (req, res) => {
  let id = req.params.id;
  let user;

  try {
    user = await User.findByIdAndRemove(id);
  } catch (error) {
    console.log(error);
  }

  if (!user) {
    return res
      .status(403)
      .json({ message: "Unable To Delete The User With This Id" });
  }

  return res.status(200).json({ message: "Account Deleted" });
};

module.exports = {
  getAllUsrs,
  adminSignIn,
  adminSignUp,
  adminSignout,
  adminEditUsers,
  verifyToken,
  adminDeleteUser,
};
