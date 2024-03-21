if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');    //method-override is a middleware that allows a POST request to be changed to a PUT or DELETE request. 实现客户端中并不支持的 HTTP 请求方法（例如 PUT、DELETE)
const passport = require('passport');
const LocalStrategy = require('passport-local');      //passport-local is a strategy for authenticating with a username and password
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
// refactoring the routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');


const User = require('./models/user');
const { FORMERR } = require('dns');

// use mongo altas to store the database, and connect to database
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'
// local database location is: 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl, {
    // useCreateIndex: true,
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModift: false,
});


const app = express();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));   //mongoose.connection.on...
db.once('open', () => {
    console.log('Database connected');
});

// set up ejs and views folder
app.engine('ejs', ejsMate);      //use ejs-mate as the engine
app.set('view engine', 'ejs');   //设置视图引擎为ejs
app.set('views', path.join(__dirname, 'views'));  //设置视图文件夹路径为'views/'



app.use(express.urlencoded({ extended: true }));            // express.urlencoded is a middleware,它的作用是将请求的数据解析为 JavaScript 对象，然后将解析后的对象附加到 req.body 上，便于在后续的路由处理程序中使用
app.use(methodOverride('_method'));                         //use method-override
app.use(express.static(path.join(__dirname, 'public')));    //save the static files like css, js, images in the public folder
// use underscore to replace the dollar sign and dot in the query (injection attack)
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = 'thisshouldbeabettersecret!';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAdter: 24 * 60 * 60,
    crypto: {
        secret,
    }
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
// confugure session
const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,                                     //cookie is not accessible through client side script
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,      //set the cookie to expire in a week (in milliseconds)
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};
app.use(session(sessionConfig));
app.use(flash());

// restrict locations that can fetch resources from our server
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            // styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvtqo8whc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());                              // have to use after app.use(session());
passport.use(new LocalStrategy(User.authenticate()))      //authenticate() is a method that comes from passport-local-mongoose

passport.serializeUser(User.serializeUser());             // tell passport how to serialize 序列化 a user, serialization refers to how do we store a user in the session
passport.deserializeUser(User.deserializeUser());         // tell passport how to deserialize a user, deserialization refers to how do we get a user out of the session


// set up flash middleware
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;        
    res.locals.success = req.flash('success');     //res.flash() 用于在请求之间传递临时消息,它从请求对象中获取名为 'success' 的 Flash 消息
    res.locals.error = req.flash('error');
    next();
})


// /register - FORM
// POST /register - create a user
app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'donggg@gmail.com', username: 'donggg'});
    const newUser = await User.register(user, 'chicken');                // register() is a passport-local-mongoose built-in method, (user object, password),it will check if username is unique, and hash the password
    res.send(newUser);
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);     // set mergeParams: true in the router


app.get('/', (req, res) => {
    res.render('home');          //render home.ejs
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));  //pass the error to the next middleware
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    //use render() to render the error page
    res.status(statusCode).render('error', { err });
});    

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

