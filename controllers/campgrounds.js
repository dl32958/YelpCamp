// refactored camgrounds routers code using controller
const Campground = require('../models/campground.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});      //find all campgrounds
    res.render('campgrounds/index', { campgrounds })    //render index.ejs
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // basic validation
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    // loop over uploaded images and take the path and filename, and map them into an array of objects, and add them to the campground.images
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);       //campground[title] - get the inside of []
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();                                      //save to the database
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);               //redirect to the show page
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;                                                             //structure of req.params is {id: 'xxxx'}
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});   //... means to spread the object.扩展语法
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));                // map the images into an array of objects
    campground.images.push(...imgs);                                                       // existing images is an array, so we want to push the new image objects into the array
    await campground.save();
    // delete images in both cloudinary and mongodb
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            // delete the images in cloudinary
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {filename: {$in: req.body.deleteImages}}})
        console.log(campground)
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}

// res.render(’ejs_file_name’, optional data object)