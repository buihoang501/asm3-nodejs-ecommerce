//Session
const Session = require("../models/Session");

//Get all sessions
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({});

    //Send response
    res.status(200).json({ sessions });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};
