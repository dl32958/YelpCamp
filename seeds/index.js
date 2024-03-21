const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,                                   //usecreateindex is deprecated
    useUnifiedTopology: true
}); 

const db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

//pass in array, return a random element from the array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    // const c = new Campground({title: 'purple field'});
    // await c.save();
    for (let i = 0; i < 300; i ++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '65f1625ac1964f12057f8c41',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [ 
                    cities[random1000].longitude, 
                    cities[random1000].latitude ,
                ] 
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dvtqo8whc/image/upload/v1710788577/YelpCamp/hbyhciaktplikufuddq2.jpg',
                    filename: 'YelpCamp/hbyhciaktplikufuddq2',
                },
                {
                    url: 'https://res.cloudinary.com/dvtqo8whc/image/upload/v1710786418/YelpCamp/w0yw1mefqdl80unvjnnp.jpg',
                    filename: 'YelpCamp/w0yw1mefqdl80unvjnnp',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    db.close();
});