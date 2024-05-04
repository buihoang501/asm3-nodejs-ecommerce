//Order Model
const Order = require("../models/Order.js");

//User Model
const User = require("../models/User.js");

//Product Model
const Product = require("../models/Product.js");

//Validation Result
const { validationResult } = require("express-validator");

//Gmail send
const Send = require("../../gmail-config.js");

//Socket io
const io = require("../../socket-io.js");

//Create Order Logic - Client
exports.postCreateOrder = async (req, res, next) => {
  //Get body data
  const { address, cart, totalPrice } = req.body;
  try {
    //Validation erorrs
    const errors = validationResult(req);

    //Check if we have validation errors
    if (!errors.isEmpty()) {
      //Send validation errors response
      return res.status(422).json({ errors: errors.array() });
    }

    //Create new order
    const order = new Order({
      userId: req.userId,
      items: cart.map((item) => {
        const { quantity, ...others } = item;

        return {
          product: others,
          quantity: quantity,
        };
      }),
      totalPrice: totalPrice,
    });

    //Loop through order items
    for (let item of order.items) {
      //Update product stock
      const product = await Product.findById(item.product.id);
      if (item.quantity > product.stock) {
        return res
          .status(403)
          .json({ message: "Quantity exceeded product quantity in stock!" });
      }
      product.stock -= parseInt(item.quantity);

      //Send data updated quantity client real-time
      io.getIO().emit("product", { action: "PRODUCT", product });

      //Save
      await product.save();
    }

    //Update user
    const user = await User.findById(req.userId);
    user.address = address;

    //Render tbody
    const renderTableBody = order.items
      .map((item) => {
        let htmlItem = `
          <tr key="${item._id}">
          <td>${item.product.name}</td>
          <td><img src=${item.product.img} alt=${item.product.name}/></td>
         <td>${
           new Intl.NumberFormat()
             .format(item.product.price)
             .replace(/,/g, ".") + "  VND"
         }</td>
          <td>${item.quantity}</td>
          <td>${
            new Intl.NumberFormat()
              .format(item.quantity * item.product.price)
              .replace(/,/g, ".") + "  VND"
          }</td>
          </tr>`;
        return htmlItem;
      })
      .join("");

    //Html email
    const html = `
    <html>
    <head>
    <style>
    body{
      color:#faf3e7!important;
    }
    .container{
      background-color:#1d1e1f;
      color:#faf3e7!important;
      padding:1rem 1rem 1rem 2rem;
    }

    table{
     border:1px solid #a39987;
    }
   td,th{
      border-collapse:collapse;
      border:1px solid #a39987;
    }
    th{
      text-align:center;
      padding: 0.5rem;
    }
    
    td{
       text-align:center;
       padding-left:0.5rem;
       padding-right:0.5rem;
       font-size:1.05rem;
       font-weight:500;
    }

    p{
      font-weight:500;
      font-size:0.9rem;
    }

    h1,h2{
      font-weight:500;
      font-size:1.3rem;
      margin:0;
    }

    .checkout{
      margin-top:1rem;
    }

    .thank{
      margin-top:2rem;
    }

    .container img{
      width: 90px;
    }
    </style>
    </head>
    <body >
     <div class="container">
      <h1>Xin Chào ${user.fullName}</h1>
      <p>Phone: ${user.phoneNumber}</p>
      <p>Address: ${address}</p>
      <table>
        <thead>
          <tr>
            <th >Tên sản phẩm</th>
            <th >Hình ảnh</th>
            <th >Giá</th>
            <th >Số lượng</th>
            <th >Thành tiền</th>
          </tr>
        </thead>
        <tbody>
         ${renderTableBody}
        </tbody>
      </table> 
      <div class="checkout">
        <h2>Tổng Thanh Toán:</h2>
        <h2>${
          new Intl.NumberFormat().format(order.totalPrice).replace(/,/g, ".") +
          "  VND"
        }</h2>
        <h2 class="thank">Cảm ơn bạn!</h2>

      </div>  
    </div>
     </body>
    </html>`;

    //send email to user when ordering
    Send(
      {
        html: html,
        to: user.email,
        subject: "Order successfully",
      },
      (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
      }
    );

    //save order and user to database

    await Promise.all([order.save(), user.save()]);

    //Send response to client
    return res.status(201).json({ message: "Order created successfully." });

    //Create new order
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Get all current user orders - Client
exports.getUserOrders = async (req, res, next) => {
  try {
    //Get orders current user
    const orders = await Order.find({ userId: req.userId }).populate({
      path: "userId",
      select: "-password",
    });

    //Send response to client
    res.status(200).json({ orders });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Get current user detail order
exports.getUserDetailOrder = async (req, res, next) => {
  //OrderId
  const { orderId } = req.params;

  try {
    //Find with orderId
    const order = await Order.findOne({
      $and: [{ userId: req.userId, _id: orderId }],
    }).populate({
      path: "userId",
      select: "-password",
    });

    //Send response to client
    res.status(200).json({ order });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Get admin orders
exports.getAdminOrders = async (req, res, next) => {
  try {
    //get total users ,  get total orders , all orders
    const [totalUsers, totalOrders, orders] = await Promise.all([
      User.find({ role: "user" }).countDocuments(),
      Order.find({}).countDocuments(),
      Order.find({}),
    ]);

    //Calcuting earnings
    const earnings = orders.reduce((acc, curr) => {
      return acc + curr.totalPrice;
    }, 0);

    //Set up current time
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const startDateCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endDateCurrentMonth = new Date(currentYear, currentMonth, 0);

    //Total Current Month Revenue
    let totalCurrentMonthRevenue = 0;
    const ordersInMonth = await Order.find({
      createdAt: { $gte: startDateCurrentMonth, $lte: endDateCurrentMonth },
    });

    totalCurrentMonthRevenue = ordersInMonth.reduce((acc, curr) => {
      return acc + curr.totalPrice;
    }, 0);

    //Total Revenue
    let totalRevenue = 0;
    //Total months
    let totalMonths = 0;

    //looping through from  1st month to currentMonth
    for (let month = 1; month <= currentMonth; month++) {
      const startDate = new Date(currentYear, month - 1, 1); // the first date of the month
      const endDate = new Date(currentYear, month, 0); // the last date of the month

      //Get all orders in month
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      //Revenue in this month
      const totalMonthRevenue = orders.reduce((total, current) => {
        return total + current.totalPrice;
      }, 0);

      //The sum of months' revenue
      totalRevenue += totalMonthRevenue;
      //The sume of months
      totalMonths++;
    }

    //Get the balance
    const balance = totalRevenue / totalMonths;
    //Get 8 latest orders
    const lastestOrders = await Order.find({})
      .populate({ path: "userId", select: "-password" })
      .sort({ createdAt: -1 })
      .limit(8);

    //sending response to admin
    res.status(200).json({
      totalUsers,
      totalOrders,
      earnings,
      balance,
      totalCurrentMonthRevenue,
      lastestOrders,
    });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};

//Get admin order detail
exports.getAdminOrderDetail = async (req, res, next) => {
  //OrderId
  const { orderId } = req.params;

  try {
    //Find order detail
    const order = await Order.findById(orderId).populate({
      path: "userId",
      select: "-password",
    });

    //Send response to admin
    res.status(200).json({ order: order });
  } catch (error) {
    //Config error middleware
    const err = new Error(error);
    err.httpStatus = 500;
    //Next to error middleware
    next(err);
  }
};
