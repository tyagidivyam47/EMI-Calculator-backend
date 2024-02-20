const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1200,
  },
});
module.exports = mongoose.model("OTP", otpSchema);
