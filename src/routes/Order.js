//Get express
const express = require("express");

//router
const router = express.Router();

//Order controller
const orderControllers = require("../controllers/Order");

//Express validator
const { body } = require("express-validator");

//Check auth token
const {
  checkAuthToken,
  checkAdminAndConsultant,
} = require("../middlewares/Auth");

// @Post  /api/orders/   @Client create order
router.post(
  "/",
  checkAuthToken,
  [body("address").notEmpty().withMessage("Please enter your address.")],
  orderControllers.postCreateOrder
);

// @Get /api/orders/  @Client get current user orders
router.get("/", checkAuthToken, orderControllers.getUserOrders);

// @Get /api/orders/admin  @Admin get all orders info
router.get(
  "/admin",
  checkAuthToken,
  checkAdminAndConsultant,
  orderControllers.getAdminOrders
);

// @Get /api/orders/admin/:orderId  @Admin get order detail
router.get(
  "/admin/:orderId",
  checkAuthToken,
  checkAdminAndConsultant,
  orderControllers.getAdminOrderDetail
);

//@Get /api/orders/:orderId  @Client get current user detail order
router.get("/:orderId", checkAuthToken, orderControllers.getUserDetailOrder);

//Export default Order router
module.exports = router;
