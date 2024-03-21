const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
// import middlewares
const { storeReturnTo } = require('../middleware');
// import controllers
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.login);

router.get('/logout', users.logout);


// register page
// router.get('/register', users.renderRegister);

// register a new user
// router.post('/register', catchAsync(users.register));

// login page
// router.get('/login', users.renderLogin);

// to login
// use the storeReturnTo middleware to save the returnTo value from session to res.locals
// router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.login);

// logout
// router.get('/logout', users.logout);


module.exports = router;

