const express = require("express");
const path = require("path");
const router = express.Router();
const { upload } = require("../multer");
const user = require("../model/user");
const fs = require("fs");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const catchAsync = require("../utils/catchAsync");
const { sendToken } = require("../utils/sendJWTToken");
const { isAuthenticate } = require("../middleware/auth");

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  const { name, email, password } = req.body;

  const existUser = await user.findOne({ email });

  const fileName = req.file.filename;
  const fileUrl = path.join(fileName);
  if (existUser) {
    fs.unlink("uploads/" + fileName, (err) => {
      if (err) {
        res.status(500).json({ message: "Error Deleting File" });
        return;
      } else {
        res.json({ message: "file Deleted Succesfully" });
      }
    });
  }

  const userData = { name, email, password, avatar: fileUrl };

  const activationToken = createActivationToken(userData);
  const activationUrl = `http://localhost:3000/activation/${activationToken}`;

  try {
    await sendMail({
      email: userData.email,
      subject: "Activate Your Account",
      message: `Hello ${userData.name}, Please click on the link to activate Your Account : ${activationUrl}`,
    });
    res.status(201).json({
      success: true,
      message: `Please Check Your Email ${userData.email} to activate Your Account 🧾`,
    });
  } catch (error) {
    return new ErrorHandler(error.message, 500);
  }
});

const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

router.post(
  "/activation",
  catchAsync(async (req, res, next) => {
    try {
      const { activationToken } = req.body;
      const isWriteUser = jwt.verify(
        activationToken,
        process.env.ACTIVATION_SECRET
      );
      if (!isWriteUser) {
        return new ErrorHandler("Invailid Token", 400);
      }
      const { name, email, password, avatar } = isWriteUser;
      let newUser;

      try {
        newUser = await user.create({ name, email, password, avatar });
        sendToken(newUser, 201, res);
      } catch (error) {
        if (error.code === 11000) {
          return next(new ErrorHandler("User Already Exist", 400));
        }
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      console.log(error);
      return new ErrorHandler(error.message, 500);
    }
  })
);

router.post(
  "/login-user",
  catchAsync(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Plase Provoide Email and Password", 400));
      }

      const loginingUser = (await user.find({ email }).select("+password"))[0];
      if (!loginingUser)
        return next(
          new ErrorHandler("Please provoide write email or Password", 400)
        );

      const isWritePass = await loginingUser.comparePassword(password);
      if (!isWritePass)
        return next(
          new ErrorHandler("Please provoide write email or Password", 400)
        );

      sendToken(loginingUser, 201, res);
    } catch (error) {
      return new ErrorHandler(error.message, 500);
    }
  })
);

router.get(
  "/getuser",
  isAuthenticate,
  catchAsync(async (req, res, next) => {
    try {
      const { user } = req;

      if (!user) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/logout",
  catchAsync((req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.status(201).json({
        success: true,
        message: "Log Out Successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user info
router.put(
  "/update-user-info",
  isAuthenticate,
  catchAsync(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;

      const User = await user.findOne({ email }).select("+password");

      if (!User) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await User.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      User.name = name;
      User.email = email;
      User.phoneNumber = phoneNumber;

      await User.save();

      res.status(201).json({
        success: true,
        User,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user avatar
router.put(
  "/update-avatar",
  isAuthenticate,
  upload.single("image"),
  catchAsync(async (req, res, next) => {
    try {
      // const existsUser = await user.findById(req.user.id);

      const existAvatarPath = `uploads/${req.user.avatar}`;

      fs.unlinkSync(existAvatarPath);

      const fileUrl = path.join(req.file.filename);

      const User = await user.findByIdAndUpdate(req.user.id, {
        avatar: fileUrl,
      });

      res.status(200).json({
        success: true,
        User,
        fileUrl,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user addresses
router.put(
  "/update-user-addresses",
  isAuthenticate,
  catchAsync(async (req, res, next) => {
    try {
      const User = req.user;

      const sameTypeAddress = User.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`)
        );
      }

      const existsAddress = User.addresses.find(
        (address) => address._id === req.body._id
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // add the new address to the array
        User.addresses.push(req.body);
      }

      await User.save();

      res.status(200).json({
        success: true,
        user: User,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete user address
router.delete(
  "/delete-user-address/:id",
  isAuthenticate,
  catchAsync(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      await user.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );

      const User = await user.findById(userId);

      res.status(200).json({ success: true, user: User });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user password
router.put(
  "/update-user-password",
  isAuthenticate,
  catchAsync(async (req, res, next) => {
    try {
      const User = await user.findById(req.user.id).select("+password");

      const isPasswordMatched = await User.comparePassword(
        req.body.oldPassword
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Password doesn't matched with each other!", 400)
        );
      }
      User.password = req.body.newPassword;

      await User.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
