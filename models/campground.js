const mongoose = require('mongoose');
const Review = require('./review')
const User = require('./user')
const Schema = mongoose.Schema;     //use mongoose.Schema.Types.xxxx for many times, short everything slightly

// set up a virtual property thumbnail for the images
const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// mongoose cannot include virtuals when converting a document to JSON, so we need to set the toJSON option to true
const opts = { toJSON: { virtuals: true } };  
//creates a new Mongoose Schema named CampgroundSchema
//定义 Campground 模型
const CampgroundSchema = new Schema({    //== new mongoose.Schema({})
    title: String,
    // image will be an array, each has a url and a filename
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],  // 'geometry.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // associate the campgrounds with the reviews
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
        <p>${this.description.substring(0,20)}...</p>
        `;
});

// when use findByIdAndDelete, it will trigger findOneAndDelete, and then delete the reviews associated with specific campground
// delete the reviews associated with the campground when the campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//Mongoose 在默认情况下会使用集合名的复数形式。这意味着当你定义一个名为 Campground 的 Mongoose 模型时，
//Mongoose 会假设它对应的 MongoDB 集合名为 campgrounds（注意是复数形式）。这种行为是因为在 MongoDB 中，集合名通常是复数形式的。
//Mongoose 会默认将该模型映射到名为 campgrounds 的 MongoDB 集合中。
//mongoose.model() 方法用于将一个 Mongoose Schema编译为一个 Mongoose 模型，即创建了一个模型。该方法接受两个参数：
//第一个参数是模型的名称（在数据库中对应的集合名），第二个参数是模式对象。
//module.exports 是 Node.js 中的一个特殊对象，用于导出模块的内容。它的作用是让模块中的变量、函数或对象可以被其他文件引用和使用。
//Campground这个Mongoose 模型被用来与 MongoDB 数据库中的一个集合（通常是名为 "campgrounds" 的集合）进行交互
module.exports = mongoose.model('Campground', CampgroundSchema);  //export the model, and the model name is 'Campground' and the schema is CampgroundSchema
