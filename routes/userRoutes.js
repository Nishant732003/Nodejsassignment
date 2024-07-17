const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/userController");

router
  .route("/register")
  .post(authControllers.register);
router.route("/login").post(authControllers.login);
router.post("/forgot-password", authControllers.forgetPassword);
router.put("/reset-password/:token", authControllers.resetPassword);

module.exports = router;
