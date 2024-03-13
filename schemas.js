
const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    //not same as a schema model in mongoose, just a validation schema we use before we insert or update the data
    //campground is an object, and it has title, price, image, description, location
    //.object is type, .required() is required
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});

// expected data structure
// review: {
//     rating: Number,
//     body: String
// }