//Dot env configuration
require("dotenv").config();

//Get packages
const express = require("express");
const cors = require("cors");
const path = require("path");

//Import modules fomr other files
const authRoutes = require("./src/routes/Auth");
const productRoutes = require("./src/routes/Product");
const orderRoutes = require("./src/routes/Order");
const sessionRoutes = require("./src/routes/Session");
const connectDB = require("./src/config/db");
const handleChatIO = require("./src/utils/chat-io-handler");

//Initialize app
const app = express();

//Apply middlewares
app.use(cors()); // Crossing origin resources    sharing middleware
app.use(express.json()); // Parse JSON request from body.
app.use(express.static(path.join(__dirname, "./src/public")));
app.use("/api/auth", authRoutes); // Define auth routes in middleware
app.use("/api/products", productRoutes); // Define product routes in middleware
app.use("/api/orders", orderRoutes); // Define order routes in middleware
app.use("/api/session", sessionRoutes); // Define session routes in middleware

//Error midleware
app.use((error, req, res, next) => {
  //Send error response
  res.status(error.httpStatus).json({ message: error.message });
});

//PORT config
const PORT = process.env.PORT || 5000;

//Connect to MongoDB
connectDB()
  .then(() => {
    console.log("DB connection established");
    //Listening app
    const server = app.listen(PORT, () => {
      console.log(`Server is listenning on PORT ${PORT}`);
    });

    const io = require("./socket-io").init(server, {
      cors: {
        origin: "*",
      },
    });
    io.on("connection", (socket) => {
      console.log("Client Connected!");
      //After connected
      //Handle chat messages
      handleChatIO(socket, io);
    });
  })
  .catch((err) => {
    //something went wrong
    console.log(err);
  });
