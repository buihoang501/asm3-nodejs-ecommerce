//Get express
const express = require("express");

//router
const router = express.Router();

//Auth middleware
const {
  checkAuthToken,
  checkAdminAndConsultant,
} = require("../middlewares/Auth");

//Product controller
const sessionControllers = require("../controllers/Session");

// @GET  /api/sessions/   @GET all sessions chat
router.get(
  "/",
  checkAuthToken,
  checkAdminAndConsultant,
  sessionControllers.getSessions
);

module.exports = router;
