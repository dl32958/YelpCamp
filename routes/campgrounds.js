// deconstructuring and breakin out the campground routes
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
// import middlewares
const { validateCampground } = require('../middleware.js');
const { isAuthor } = require('../middleware.js');
const { isLoggedIn } = require('../middleware.js');
// import controllers
const campgrounds = require('../controllers/campgrounds.js');

const multer  = require('multer');
const { storage } = require('../cloudinary');                 // node automatically looks for index.js file
const upload = multer({ storage });


// use router.route() to chain the routes together
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))



router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


// router.get('/', catchAsync(campgrounds.index));

// new campground page - display the form
// have to put this route before /campgrounds/:id, because :id will match anything
// router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// create a new campground (using post request)
// 用catchAsync包装async函数，以便在出现错误时捕获错误
// use isLoggedIn here to protect the route, that send from Postman or other API tools
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// show page - display a single campground
// router.get('/:id', catchAsync(campgrounds.showCampground));

// edit page - edit a campground
// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// update a campground after editing
// PUT 请求通常用于更新已存在的资源，例如更新数据库中的记录。PUT 请求的主体包含了要更新的资源的新状态。
// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// delete page - delete a campground
// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


module.exports = router;