
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);          //create a new review
    review.author = req.user._id;
    campground.reviews.push(review);                     //push the review to the campground
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}
// POST /campgrounds/:id(campground id)/reviews


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    // $pull is a mongodb operator, which removes from an existing array all instances of a value or values that match a specified condition.
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });  //remove the review from the campground
    await Review.findByIdAndDelete(reviewId);                                  //delete the review
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}