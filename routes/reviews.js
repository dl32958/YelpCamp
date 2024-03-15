// deconstructuring and breakin out the review routes
const express = require('express');
// Express router likes to keep params separate.
// mergeParams: true is to merge the params from the parent router (campgrounds.js) with the current router (reviews.js)
const router = express.Router({ mergeParams: true }); 
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');
const Review = require('../models/review');



// create a new review, and use isLoggedIn to check if user logged in and use validateReview to validate the review
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);          //create a new review
    review.author = req.user._id;
    campground.reviews.push(review);                     //push the review to the campground
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));
// POST /campgrounds/:id(campground id)/reviews


// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // $pull is a mongodb operator, which removes from an existing array all instances of a value or values that match a specified condition.
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });  //remove the review from the campground
    await Review.findByIdAndDelete(reviewId);                                  //delete the review
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;