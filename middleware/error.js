const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // wrong mongodb id Error
  if (err.name === "castError") {
    const message = `Resource not found with this id.. Invailid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key value
  if (err.code === 11000) {
    const message = `Duplicate Key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key value
  if (err.name === "JsonWebTokenError") {
    const message = `Your Url is invailid Please try again letter`;
    err = new ErrorHandler(message, 400);
  }

  // Token Expired Error
  if (err.name === "TokenExpiredError") {
    const message = `Your Url is Expired Please try again letter`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
