//Get express
const express = require("express");

//router
const router = express.Router();

//Auth Controller
const authControllers = require("../controllers/Auth");

//Express Validator
const { body } = require("express-validator");

//User Model
const User = require("../models/User");

//BcryptJS
const bcrypt = require("bcryptjs");
const { checkAuthToken } = require("../middlewares/Auth");

// @POST  /api/auth/signup
router.post(
  "/signup",
  [
    body("fullName")
      .isLength({ min: 5 })
      .withMessage("Full Name must be at least 5 characters.")
      .isAlpha()
      .withMessage(
        "Full Name must contain alpha characters with no whitespace."
      ),
    body("email")
      .notEmpty()
      .withMessage("Email could not be empty.")
      .isEmail()
      .withMessage("Email must be valid.")
      .custom(async (value, { req }) => {
        //Find user already exists
        const user = await User.findOne({ email: value });

        //Check if user already exists
        if (user) {
          //Return error
          return Promise.reject(
            "Email already exists, please pick another one."
          );
        }
        return true;
      }),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone Number could not be empty.")
      .custom((value, { req }) => {
        const phoneRegexPattern =
          /^(\+?84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9\d)\d{7}$/;
        if (!phoneRegexPattern.test(value)) {
          throw new Error(
            "Invalid phone number, it must be 10 digits and starts with +84/0..."
          );
        }
        return true;
      }),
  ],
  authControllers.postUserSignup
);

// @POST  /api/auth/login/admin
router.post(
  "/login/admin",
  [
    body("email")
      .notEmpty()
      .withMessage("Email could not be empty.")
      .isEmail()
      .withMessage("Email must be valid.")
      .custom(async (value, { req }) => {
        //Find user with email
        const user = await User.findOne({ email: value });

        //Check if user doesn't exist with email
        if (!user) {
          //Return error
          return Promise.reject("Couldn't find user with email" + " " + value);
        }

        return true;
      }),
    body("password")
      .notEmpty()
      .withMessage("Password could not be empty ")
      .custom(async (value, { req }) => {
        //Check email from body
        if (!req.body.email) {
          throw new Error("Please enter your email before entering password");
        }

        //Find user with email
        const user = await User.findOne({ email: req.body.email });

        //Check user doesn't exist in database
        if (!user) {
          return Promise.reject("Invalid password");
        }

        //Password Comparison
        const isPasswordMatching = await bcrypt.compare(value, user.password);

        //Not matching password
        if (!isPasswordMatching) {
          return Promise.reject("Invalid password");
        }
        return true;
      }),
  ],
  authControllers.postAdminLogin
);

// @POST  /api/auth/login
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email could not be empty.")
      .isEmail()
      .withMessage("Email must be valid.")
      .custom(async (value, { req }) => {
        //Find user with email
        const user = await User.findOne({ email: value });

        //Check if user doesn't exist with email
        if (!user) {
          //Return error
          return Promise.reject("Couldn't find user with email" + " " + value);
        }

        return true;
      }),
    body("password")
      .notEmpty()
      .withMessage("Password could not be empty ")
      .custom(async (value, { req }) => {
        //Check email from body
        if (!req.body.email) {
          throw new Error("Please enter your email before entering password");
        }

        //Find user with email
        const user = await User.findOne({ email: req.body.email });

        //Check user doesn't exist in database
        if (!user) {
          return Promise.reject("Invalid password");
        }

        //Password Comparison
        const isPasswordMatching = await bcrypt.compare(value, user.password);

        //Not matching password
        if (!isPasswordMatching) {
          return Promise.reject("Invalid password");
        }
        return true;
      }),
  ],
  authControllers.postUserLogin
);

router.get("/user", checkAuthToken, authControllers.getCurrentUser);

//Export default auth router
module.exports = router;
