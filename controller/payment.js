const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../utils/catchAsync");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    req.headers.Authorization =
      "Bearer sk_test_51NEL4KSB2G9vM6P8sDZNKaE6rRgfWo9Puul8zwWJUaUxTUtUyhSqSSpQw1dweVSL5qOdBpeAXUUA2geOsOXR9mdO00ieNsdAnj";
    console.log(req.headers);
    console.log(process.env.STRIPE_SECRET_KEY);
    try {
      // const myPayment = await stripe.paymentIntents.create({
      //   amount: req.body.amount,
      //   currency: "inr",
      //   metadata: {
      //     company: "Becodemy",
      //   },
      // });
      // const myPayment = await stripe.paymentIntents.create({
      //   amount: 1099,
      //   currency: "inr",
      //   automatic_payment_methods: {
      //     enabled: true,
      //   },
      // });

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "T-shirt",
              },
              unit_amount: 2000,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:3000/order/success",
        cancel_url: "http://localhost:4242/cancel",
      });

      res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  })
);

router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

module.exports = router;
