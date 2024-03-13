// deconstructuring and breakin out the review routes
const express = require('express');
// Express router likes to keep params separate.
// mergeParams: true is to merge the params from the parent router (campgrounds.js) with the current router (reviews.js)
const router = express.Router({ mergeParams: true }); 

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');


// validate review middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// create a new review, and add validation middleware
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);          //create a new review
    campground.reviews.push(review);                     //push the review to the campground
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));
// POST /campgrounds/:id(campground id)/reviews


// delete a review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // $pull is a mongodb operator, which removes from an existing array all instances of a value or values that match a specified condition.
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });  //remove the review from the campground
    await Review.findByIdAndDelete(reviewId);                                  //delete the review
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;