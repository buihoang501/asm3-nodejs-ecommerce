//Product Model
const Product = require("../models/Product");
//Handle unlink file
const { handleUnlinkFile } = require("../utils/file");

//Validation result
const { validationResult } = require("express-validator");

//Socket io
const io = require("../../socket-io");

//Get all products Client Homepage
exports.getProducts = async (req, res, next) => {
  try {
    //Query all products in products collection
    const products = await Product.find({});

    //Send response to Client
    res.status(200).json({ products: products });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Get products in cart client cart page
exports.getProductsCart = async (req, res, next) => {
  //Get productIds
  const { productIds } = req.body;

  try {
    //Query  products in productIDs
    const products = await Product.find({
      _id: { $in: productIds.split("\n") },
    });

    //Send response to Client
    res.status(200).json({ products: products });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Get detail product in Client Product Detail Page
exports.getProduct = async (req, res, next) => {
  //Get productId from params
  const { productId } = req.params;

  try {
    //Find product by productId
    const product = await Product.findById(productId);

    //Related products
    const relatedProducts = await Product.find({
      $and: [{ category: product.category }, { _id: { $nin: [product._id] } }],
    });

    //Send response to Client
    res
      .status(200)
      .json({ product: product, relatedProducts: relatedProducts });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};
//Admin get edit product
exports.getEditProduct = async (req, res, next) => {
  //Product Id
  const { productId } = req.params;

  try {
    //Find product by productId
    const product = await Product.findById(productId);

    //Send response to admin
    return res.status(200).json({ product });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Admin create product
exports.postAdminCreateProduct = async (req, res, next) => {
  //Body data
  const { name, category, shortDescription, longDescription, price, stock } =
    req.body;

  try {
    // image url array
    const imageUrls =
      req.files.length > 0 &&
      req.files.map((file) => {
        return file.path.replace(/^.*?images(\/|\\)/, "images/");
      });

    //errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //Unlink files
      if (req.files.length > 0) {
        for (let file of req.files) {
          handleUnlinkFile(file?.path);
        }
      }

      return res.status(422).json({ errors: errors.array() });
    }

    //Create new product
    const product = new Product({
      name: name,
      category: category,
      short_desc: shortDescription,
      long_desc: longDescription,
      price: price,
      stock: stock,
      img1: imageUrls[0],
      img2: imageUrls[1],
      img3: imageUrls[2],
      img4: imageUrls[3],
    });

    //Save product to DB
    await product.save();

    //Send response to admin - Success
    res.status(201).json({ message: "Create product successfully!" });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Admin edit product
exports.patchAdminEditProduct = async (req, res, next) => {
  //Body data
  const { name, category, shortDescription, longDescription, price, stock } =
    req.body;
  //ProductId
  const { productId } = req.params;

  try {
    //errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //Find product with productId
    const updatedProduct = await Product.findById(productId);

    //updated product
    updatedProduct.name = name;
    updatedProduct.category = category;
    updatedProduct.short_desc = shortDescription;
    updatedProduct.long_desc = longDescription;
    updatedProduct.price = price;
    updatedProduct.stock = stock;

    //Send data updated quantity client real-time
    io.getIO().emit("product", { action: "PRODUCT", product: updatedProduct });
    //Save updatedProduct to DB
    await updatedProduct.save();

    //Send response to admin - Success
    res.status(201).json({ message: "Update succesfully!" });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Admin edit product
exports.deleteAdminProduct = async (req, res, next) => {
  //ProductId
  const { productId } = req.params;

  try {
    //Delete product by productId

    await Product.findByIdAndDelete(productId);

    //Send response to admin - Success
    res.status(200).json({ message: "Delete succesfully!" });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};
