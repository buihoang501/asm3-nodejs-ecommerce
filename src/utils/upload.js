//Path
const path = require("path");

//multer
const multer = require("multer");

//Multer storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Math.random().toString() + file.originalname.replace(/\s/g, ""));
  },
});

//filter files

const uploads = multer({ storage: fileStorage });

//Export uploads files
module.exports = uploads;
