require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const authRoutes = require("./Routes/Auth");
const actionRoutes = require("./Routes/Action");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  let message = status === 500 ? "Internal Server Error" : error.message;
  const data = error.data;

  res.status(status).json({ message: message, data: data });
});

app.use(authRoutes);
app.use(actionRoutes);

const PORT = process.env.PORT || 8001;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL).then((result) => {
  app.listen(PORT);
  console.log("Connection Established", PORT);
});

// https://documenter.getpostman.com/view/32912362/2sA2r834p1
