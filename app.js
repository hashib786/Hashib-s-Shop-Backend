const express = require("express");
const cookieParser = require("cookie-parser");
const { urlencoded } = require("body-parser");
const cors = require("cors");

const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowList = ["http://localhost:3000", "https://hashibs-shop.vercel.app"];
app.use(
  cors((req, callback) => {
    let corsOptions;
    allowList.indexOf(req.header("Origin")) !== -1
      ? (corsOptions = { origin: true }) // reflect (enable) the requested origin in the CORS response
      : (corsOptions = { origin: false }); // disable CORS for this request
    callback(null, corsOptions); // callback expects two parameters: error and options
  })
);
app.use("/", express.static("uploads"));
app.use(urlencoded({ extended: true }));

app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/order", order);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something Went wrong 🔥🔥🔥",
  });
});

module.exports = app;
