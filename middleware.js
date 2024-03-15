const { campgroundSchema } = require('./schemas.js');
const { reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');
const Campground = require('./models/campground.js');
const Review = require('./models/review.js');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log('REQ.USER...', req.user);               // check if someone is logged in
    if (!req.isAuthenticated()){                        // use isAuthenticated() to check if the user is logged in
        req.session.returnTo = req.originalUrl;         // store user's current url in the session
        req.flash('error', 'you must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

// to transfer the returnTo value from the session (req.session.returnTo) to the Express.js app res.locals object
// res.locals is an object that provides a way to pass data through the application during the request-response cycle.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// 客户端的表单验证是一个重要的防御措施，但它并不能完全防止用户绕过验证。用户仍然可以通过其他方式发送请求来绕过表单验证，如Postman或其他API工具。
// 因此为了保障数据的完整性和正确性，还需要在服务器端进行验证，确保接收到的数据符合预期的格式和规范。
// set up the validation middleware for campground and review
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);         // const result = schema.validate(data); if (result.error){...
    if (error) {
        //details: [[object]]
        // map the error.details to make a single message (string)
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// create middleware: add authorization for preventing to delete or edit the campground by sending a request manually (Postman/AJAX etc.)
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    } else{
        next();
    }
}

// /campgrounds/:id/reviews/:reviewId
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    } else{
        next();
    }
}

// validate review middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}