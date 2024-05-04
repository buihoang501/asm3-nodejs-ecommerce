const send = require("gmail-send")({
  user: "akiramasterxyz@gmail.com",
  pass: process.env.GMAIL_PASS,
});

module.exports = send;
