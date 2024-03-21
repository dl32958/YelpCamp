const User = require('../models/user');

module.exports.renderRegister = (req,res) => {
    res.render('users/register')
}

module.exports.register = async (req,res, next) => {       // catchAsync pass the error to the next middleware
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {      // use middleware - passport.authenticate('startegy')
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(err => {                     // req.logout() requires a callback function passed as an argument, we have to handle any errors that occur during the logout process
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    })
}