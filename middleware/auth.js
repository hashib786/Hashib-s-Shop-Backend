const Shop = require("../model/Shop");
const user = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

exports.isAuthenticate = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) next(new ErrorHandler("Please Login to continue U", 401));

  const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await user.findById(decode.id);

  next();
});

exports.isSeller = catchAsync(async (req, res, next) => {
  const { seller_token } = req.cookies;

  if (!seller_token) next(new ErrorHandler("Please Login to continue S", 401));

  const decode = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

  req.seller = await Shop.findById(decode.id);

  next();
});
