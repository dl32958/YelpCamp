// define the Review Model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Review", reviewSchema);

// 'THIS IS A GREAT PLACT'
// RATING 5