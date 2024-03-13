const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');    //method-override is a middleware that allows a POST request to be changed to a PUT or DELETE request. 实现客户端中并不支持的 HTTP 请求方法（例如 PUT、DELETE)

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {    //connect to the database yelp-camp
    // useNewUrlParser: true,                                   //useCreateIndex is deprecated
    // useUnifiedTopology: true,
    // useCreateIndex: true,
});

const app = express();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));   //mongoose.connection.on...
db.once('open', () => {
    console.log('Database connected');
});

app.engine('ejs', ejsMate);      //use ejs-mate as the engine
app.set('view engine', 'ejs');   //设置视图引擎为ejs
app.set('views', path.join(__dirname, 'views'));  //设置视图文件夹路径为/views


app.use(express.urlencoded({ extended: true }));            // express.urlencoded is a middleware,它的作用是将请求的数据解析为 JavaScript 对象，然后将解析后的对象附加到 req.body 上，便于在后续的路由处理程序中使用
app.use(methodOverride('_method'));                         //use method-override
app.use(express.static(path.join(__dirname, 'public')));    //save the static files like css, js, images in the public folder
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,                                   //cookie is not accessible through client side script
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,    //set the cookie to expire in a week (in milliseconds)
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};
app.use(session(sessionConfig));
app.use(flash());
// set up flash middleware
app.use((req, res, next) => {
    //res.flash() 用于在请求之间传递临时消息,它从请求对象中获取名为 'success' 的 Flash 消息
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);  // set mergeParams: true in the router


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

