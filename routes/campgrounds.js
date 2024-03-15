// deconstructuring and breakin out the campground routes
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
// import middlewares
const { validateCampground } = require('../middleware.js');
const { isAuthor } = require('../middleware.js');
const { isLoggedIn } = require('../middleware.js');

const Campground = require('../models/campground.js');



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});      //find all campgrounds
    res.render('campgrounds/index', { campgrounds })    //render index.ejs
}));

// new campground page
// have to put this route before /campgrounds/:id, because :id will match anything
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// make a new campground (using post request)
// 用catchAsync包装async函数，以便在出现错误时捕获错误
// use isLoggedIn here to protect the route, that send from Postman or other API tools
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // basic validation
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);       //campground[title] - get the inside of []
    campground.author = req.user._id;
    await campground.save();                                      //save to the database
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)                //redirect to the show page
}));


// show page - display a single campground
router.get('/:id', catchAsync(async (req, res) => {
    // nested populate, to populate reviews, camground author and review author
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // if campground is not exist, redirect to the campgrounds page
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));


// edit page - edit a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// update a campground after editing
// PUT 请求通常用于更新已存在的资源，例如更新数据库中的记录。PUT 请求的主体包含了要更新的资源的新状态。
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;                        //structure of req.params is {id: 'xxxx'}
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});        //... means to spread the object.扩展语法
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete page - delete a campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));
// res.render(’ejs_file_name’, optional data object)


module.exports = router;