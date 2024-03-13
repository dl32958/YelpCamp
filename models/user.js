// passport, passport-local-mongoose, passport-local

const mongoose = require('mongoose');
const Schema = mongoose.Schema;  
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// use a plugin to add the username and password to the userSchema, make sure the username is unique
UserSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model('User', UserSchema);