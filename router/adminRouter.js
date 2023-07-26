const express = require("express");
const {
  getAllUsrs,
  adminSignIn,
  adminSignUp,
  adminSignout,
  adminEditUsers,
  adminDeleteUser,
  verifyToken,
  getAdmin,getSingleUser
} = require("../controller/adminController");
const router = express.Router();

// all users
router.get("/admin", getAllUsrs);
// admin
router.get("/isadmin", verifyToken, getAdmin);
// signup & signin & signout
router.post("/adminsignup", adminSignUp);
router.post("/adminsignin", adminSignIn);
router.post("/adminsignout", adminSignout);

// update/edit user
router.put("/update/:id", adminEditUsers);
// single user
router.get("/user/:id", getSingleUser)
// delete user
router.delete("/admin/:id", adminDeleteUser);

module.exports = router;
