const express = require("express");

const authController = require("../Controllers/Auth");

const route = express.Router();

route.post("/signup", authController.signup, authController.login);

route.post("/login", authController.login);

route.get("/getPassResetLink/:email", authController.sendForgotPasswordMail);

route.put("/resetPassword", authController.resetPassword);

route.get("/generateOtp/:email", authController.generateOtp);

route.put("/verifyOtp", authController.verifyOtp);

module.exports = route;
