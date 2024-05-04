//Get express
const express = require("express");

//router
const router = express.Router();

//Auth middleware
const { checkAuthToken, checkAdmin } = require("../middlewares/Auth");

//Product controller
const productControllers = require("../controllers/Product");

//Uploads
const uploads = require("../utils/upload");

//Express validator
const { body } = require("express-validator");

// @GET  /api/products/   @Client Homepage products
router.get("/", productControllers.getProducts);

// @POST /api/products/cart  @Client Get products cart info
router.post("/products-cart", productControllers.getProductsCart);

// @GET  /api/products/admin/:productAdmin   @Admin get edit product
router.get(
  "/admin/:productId",
  checkAuthToken,
  checkAdmin,
  productControllers.getEditProduct
);
// @Delete  /api/products/admin/:productId   @Admin delete a product
router.delete(
  "/admin/:productId",
  checkAuthToken,
  checkAdmin,
  productControllers.deleteAdminProduct
);

//Export default Product router
module.exports = router;

// @Post  /api/products/admin/new-product   @Admin create new product
router.post(
  "/admin/new-product",
  checkAuthToken,
  checkAdmin,
  uploads.array("files[]", 4),
  [
    body("files").custom((value, { req }) => {
      if (req.files.length !== 4) {
        throw new Error("The number of files must be 4");
      } else {
        return true;
      }
    }),
    body("name").trim().notEmpty().withMessage("Name could not be empty"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category could not be empty"),
    body("shortDescription")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Short description is at least 5 characters"),
    body("longDescription")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Long description is at least 5 characters"),
    body("price")
      .notEmpty()
      .withMessage("Price could not be empty")
      .custom((value, { req }) => {
        if (value <= 0) {
          throw new Error("Price could not be negative");
        }
        return true;
      }),
    body("stock")
      .notEmpty()
      .withMessage("Stock could not be empty")
      .custom((value, { req }) => {
        if (value <= 0) {
          throw new Error("Stock could not be negative");
        }
        return true;
      }),
  ],
  productControllers.postAdminCreateProduct
);

// @Patch  /api/products/admin/edit-product/:productId   @Admin edit a product
router.patch(
  "/admin/edit-product/:productId",
  checkAuthToken,
  checkAdmin,

  [
    body("name").trim().notEmpty().withMessage("Name could not be empty"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category could not be empty"),
    body("shortDescription")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Short description is at least 5 characters"),
    body("longDescription")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Long description is at least 5 characters"),
    body("price")
      .notEmpty()
      .withMessage("Price could not be empty")
      .custom((value, { req }) => {
        if (value <= 0) {
          throw new Error("Price could not be negative");
        }
        return true;
      }),
    body("stock")
      .notEmpty()
      .withMessage("Stock could not be empty")
      .custom((value, { req }) => {
        if (value <= 0) {
          throw new Error("Stock could not be negative");
        }
        return true;
      }),
  ],
  productControllers.patchAdminEditProduct
);
// @GET  /api/products/:productId   @Client Product Detail Page
router.get("/:productId", productControllers.getProduct);
