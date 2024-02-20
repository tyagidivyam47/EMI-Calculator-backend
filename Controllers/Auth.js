const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("../Models/User");
const OTP = require("../Models/OTP");
const Token = require("../Models/Token");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tyagidivyam21@gmail.com",
    pass: "bukj irzy ivrw kshp",
  },
});

exports.signup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const rawPassword = req.body.password;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name || null;
    const phone = req.body.phone || null;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      res.status(403).json({ message: "User with this Email already exists" });
    }
    const password = bcrypt.hashSync(rawPassword, 12);

    const userObj = {
      email,
      password,
      first_name,
      last_name,
      phone,
    };
    const user = new User(userObj);

    user
      .save()
      .then((result) => {
        res
          .status(201)
          .json({ message: "User created successfully", userId: result._id });
      })
      .catch((error) => {
        error.statusCode = 500;
        next(error);
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      res.status(401).json({ message: "A user with this email not found" });
    }
    const isPassEqual = bcrypt.compareSync(password, existingUser.password);

    if (!isPassEqual) {
      res
        .status(401)
        .json({ message: "You have entered an incorrect password" });
    }
    const token = jwt.sign(
      {
        email: email,
        userId: existingUser._id,
      },
      "secretkey",
      { expiresIn: "24hr" }
    );
    res.status(200).json({ token: token, userId: existingUser._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.sendForgotPasswordMail = async (req, res, next) => {
  const clientUrl = "http://localhost:5173";
  try {
    const mail = req.params.email;
    const userExists = await User.findOne({ email: mail });
    console.log(userExists);
    if (!userExists) {
      res.status(404).json({ message: "Email not registered" });
    }
    let token = await Token.findOne({ userId: userExists._id });
    if (token) {
      await token.deleteOne();
    }
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 5);

    await new Token({
      userId: userExists._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${clientUrl}/passwordReset?token=${resetToken}&id=${userExists._id}`;

    transporter
      .sendMail({
        from: "EMI Buddy",
        to: mail,
        subject: `Link for forgot password from EMI Buddy`,
        text: "Forgot Password",
        html: `
        <div>
        Hii <b>${userExists.first_name}</b> <br>
        Click on the below link or copy paste it into your browser to reset your password <br>
        ${link}
        </div>
        `,
      })
      .then(() => {
        // console.log("Email sent successfully");
        res.status(200).json({ message: "Mail sent successfully" });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, userId, password } = req.body;
    let passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
      res
        .status(410)
        .json({ message: "Invalid or expired password reset link" });
    }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      res
        .status(410)
        .json({ message: "Invalid or expired password reset link" });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    await passwordResetToken.deleteOne();
    res.status(201).json("Password Reset Successful");
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.generateOtp = async (req, res, next) => {
  try {
    const email = req.params.email;
    let existingOtp = await OTP.findOne({ email });
    if (existingOtp) {
      await existingOtp.deleteOne();
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000);

    await new OTP({
      email,
      otp: randomOtp,
      createdAt: Date.now(),
    }).save();

    transporter
      .sendMail({
        from: "EMI Buddy",
        to: email,
        subject: `One Time Password for Email Verification`,
        text: "Forgot Password",
        html: `
        <div>
        Hii, <br>
        Your One Time Password for the email verification is: <br>
        <b>${randomOtp}</b>
        </div>
        `,
      })
      .then(() => {
        // console.log("Email sent successfully");
        res.status(200).json({ message: "Mail sent successfully" });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    let existingOtp = await OTP.findOne({ email });
    if (!existingOtp) {
      res.status(410).json({ message: "OTP Expired" });
    }
    const otpCorrect = existingOtp.otp.toString() === otp.toString();
    if (!otpCorrect) {
      res.status(400).json({ message: "Incorrect OTP" });
    } else {
      res.status(200).json({ message: "OTP Verified" });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
