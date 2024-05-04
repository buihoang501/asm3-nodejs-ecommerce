//Json webtoken
const jwt = require("jsonwebtoken");

//User model
const User = require("../models/User");

//Check JWT token
exports.checkAuthToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Token not found." });
  }

  try {
    //Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Put userId into req from decoded payload jwt
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(403).json({ message: "Forbidden: Invalid Token." });
  }
};

//Check Admin
exports.checkAdmin = async (req, res, next) => {
  try {
    //Get user via userId
    const user = await User.findById(req.userId);

    //Not admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Your are unauthorized!" });
    }

    next();
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Check Admin And Consultant
exports.checkAdminAndConsultant = async (req, res, next) => {
  try {
    //Get user via userId
    const user = await User.findById(req.userId);

    //Not admin
    if (user.role === "user") {
      return res
        .status(403)
        .json({ message: "Forbidden: Your are unauthorized!" });
    }

    next();
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};
