const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');


// register page
router.get('/register', (req,res) => {
    res.render('users/register')
})

// register a new user
router.post('/register', catchAsync(async (req,res, next) => {       // catchAsync pass the error to the next middleware
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        // after register, log the user in, use login()
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    }catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// login page
router.get('/login', (req, res) => {
    res.render('users/login');
})

// to login
// use the storeReturnTo middleware to save the returnTo value from session to res.locals
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), (req, res) => {    // use middleware - passport.authenticate('startegy')
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
})

// logout
router.get('/logout', (req, res) => {
    req.logout(err => {                     // req.logout() requires a callback function passed as an argument, we have to handle any errors that occur during the logout process
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    })
});


module.exports = router;

