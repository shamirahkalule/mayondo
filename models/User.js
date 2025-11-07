const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema ({
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    contact: {type: Number, required: true},
    location: {type: String, required: true},
    role: {type: String, required: true},
    email: {type: String, trim: true, unique: true,required: true},
    password: {type: String, required: true},
})
userSchema.plugin(passportLocalMongoose,{
usernameField: 'email' 
});

module.exports =mongoose.model("User", userSchema )