const express = require("express");
const {
  getAllUsrs,
  adminSignIn,
  adminSignUp,
  adminSignout,
  adminEditUsers,
  adminDeleteUser,
} = require("../controller/adminController");
const router = express.Router();

// all users
router.get("/admin", getAllUsrs);

// signup & signin & signout
router.post("/adminsignup", adminSignUp);
router.post("/adminsignin", adminSignIn);
router.post("/adminsignout", adminSignout);

// update/edit user
router.put("/admin/:id", adminEditUsers);

// delete user
router.delete("/admin/:id", adminDeleteUser);

module.exports = router;
