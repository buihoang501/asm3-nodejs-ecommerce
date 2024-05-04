//Get mongoose package
const mongoose = require("mongoose");

//Get Schema from mongoose
const Schema = mongoose.Schema;

//Defining session schema
const sessionSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
    messages: [
      {
        message: {
          type: String,
          required: true,
        },
        client: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

//Export default Session Model, sessions collection
module.exports = mongoose.model("Session", sessionSchema);
