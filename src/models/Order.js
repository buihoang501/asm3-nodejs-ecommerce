//Get mongoose package
const mongoose = require("mongoose");

//Get Schema from mongoose
const Schema = mongoose.Schema;

//Defining orderSchema
const orderSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: Object,
        },
        quantity: Number,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveryStatus: {
      type: String,
      default: "Waiting for progressing",
    },
    paymentStatus: {
      type: String,
      default: "Waiting for pay",
    },
  },
  { timestamps: true }
);

//Export default Order Model, orders collection
module.exports = mongoose.model("Order", orderSchema);
