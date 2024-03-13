const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');


// register page
router.get('/register', (req,res) => {
    res.render('users/register')
})

// register a new user
router.post('/register', catchAsync(async (req,res) => {       // catchAsync pass the error to the next middleware
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    }catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

module.exports = router;

