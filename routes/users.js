const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', failureMessage: true, keepSessionInfo: true}), users.loginUser); //passport has its own middleware to authenticate a login

router.get('/logout', users.logoutUser);

module.exports = router;