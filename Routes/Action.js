const express = require('express');

const actionController = require('../Controllers/Action');
const isAuth = require('../Middleware/is-auth');

const route = express.Router();

route.get('/getUserById/:userId',isAuth, actionController.getUserById);

module.exports = route;