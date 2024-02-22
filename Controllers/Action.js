const jwt = require("jsonwebtoken");

const User = require("../Models/User");

exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const userExists = await User.findById(userId);

    if (!userExists) {
      res.status(404).json({ message: "User does not exist" });
      return;
    }
    res.status(200).json(userExists);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
