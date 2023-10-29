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

app.use(cors());
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
