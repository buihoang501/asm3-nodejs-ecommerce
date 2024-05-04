//Get mongoose package
const mongoose = require("mongoose");

//Get Schema from mongoose
const Schema = mongoose.Schema;

//Defining productSchema
const productSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    img1: {
      type: String,
      required: true,
    },
    img2: {
      type: String,
      required: true,
    },
    img3: {
      type: String,
      required: true,
    },
    img4: {
      type: String,
      required: true,
    },
    long_desc: {
      type: String,
      required: true,
      min: 5,
    },

    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 1,
    },
    short_desc: {
      type: String,
      required: true,
      min: 5,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

//Export default Product Model, products collection
module.exports = mongoose.model("Product", productSchema);
