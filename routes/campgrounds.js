// deconstructuring and breakin out the campground routes
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
const { campgroundSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError.js');
const Campground = require('../models/campground.js');


// 客户端的表单验证是一个重要的防御措施，但它并不能完全防止用户绕过验证。用户仍然可以通过其他方式发送请求来绕过表单验证，如Postman或其他API工具。
// 因此为了保障数据的完整性和正确性，还需要在服务器端进行验证，确保接收到的数据符合预期的格式和规范。
// set up the validation middleware for campground and review
const validateCampground = (req, res, next) => {
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

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});      //find all campgrounds
    res.render('campgrounds/index', { campgrounds })    //render index.ejs
}));

// have to put this route before /campgrounds/:id, because :id will match anything
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

// make a new campground
// 用catchAsync包装async函数，以便在出现错误时捕获错误
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // basic validation
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);  //campground[title] - get the inside of []
    await campground.save();                                 //save to the database
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)         //redirect to the show page
}));

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');  //Campground is mongoose model.在 MongoDB 中的 campgrounds 集合中根据给定的 ID 查找相应的露营地文档，并返回查询到的文档对象。
    // if campground is not exist, redirect to the campgrounds page
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// edit a campground
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// update a campground after editing
//PUT 请求通常用于更新已存在的资源，例如更新数据库中的记录。PUT 请求的主体包含了要更新的资源的新状态。
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;                        //structure of req.params is {id: 'xxxx'}
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});        //... means to spread the object.扩展语法
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete a campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));
// res.render(’ejs_file_name’, optional data object)


module.exports = router;