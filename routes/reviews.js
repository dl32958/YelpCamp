// deconstructuring and breakin out the review routes
const express = require('express');
// Express router likes to keep params separate.
// mergeParams: true is to merge the params from the parent router (campgrounds.js) with the current router (reviews.js)
const router = express.Router({ mergeParams: true }); 
// import middlewares
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
// import controllers
const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');



// create a new review, and use isLoggedIn to check if user logged in and use validateReview to validate the review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;