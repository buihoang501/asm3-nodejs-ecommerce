//User Model
const User = require("../models/User");

//Validation result
const { validationResult } = require("express-validator");

//Json Webtoken
const jwt = require("jsonwebtoken");

//BcryptJS
const bcrypt = require("bcryptjs");

//Signup Controller
exports.postUserSignup = async (req, res, next) => {
  //Get body data
  const { fullName, email, password, phoneNumber } = req.body;

  try {
    //Validation erorrs
    const errors = validationResult(req);

    //Check if we have validation errors
    if (!errors.isEmpty()) {
      //Send validation errors response
      return res.status(422).json({ errors: errors.array() });
    }

    //Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create new user
    const newUser = await User({
      fullName: fullName.trimLeft().trimRight(),
      email,
      password: hashedPassword,
      phoneNumber,
    });

    //Save newUser to users collection
    await newUser.save();

    //Creating a JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    //Sending response when user signed up successfully
    res.status(201).json({
      token: token,
      userName: newUser.fullName,
    });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Login Controller
exports.postUserLogin = async (req, res, next) => {
  //Get email data from body
  const { email } = req.body;

  try {
    //Validation erorrs
    const errors = validationResult(req);

    //Check if we have validation errors
    if (!errors.isEmpty()) {
      //Send validation errors response
      return res.status(422).json({ errors: errors.array() });
    }

    //Find user with email
    const user = await User.findOne({ email: email });

    //Creating a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    //Sending response when user logged in successfully
    res.status(201).json({
      token: token,
      userName: user.fullName,
    });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Admin Login Controller
exports.postAdminLogin = async (req, res, next) => {
  //Get email data from body
  const { email } = req.body;

  try {
    //Validation erorrs
    const errors = validationResult(req);

    //Check if we have validation errors
    if (!errors.isEmpty()) {
      //Send validation errors response
      return res.status(422).json({ errors: errors.array() });
    }

    //Find user with email
    const user = await User.findOne({ email: email });

    //Check role
    if (user.role === "user") {
      //When user is not admin or consultant
      return res
        .status(403)
        .json({ message: "Forbidden - User role is not allowed." });
    }

    //Creating a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    //Sending response when user logged in successfully
    res.status(201).json({
      token: token,
      userName: user.fullName,
      userRole: user.role,
    });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Get current user info - Client
exports.getCurrentUser = async (req, res, next) => {
  try {
    //Find current user by userId
    const user = await User.findById(req.userId).select("-_id -password");

    //Return current user
    res.status(200).json({ user: user });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};
