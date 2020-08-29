const mongoose = require('mongoose');

const UserSchema = mongoose.Schema;

var userModelSchema = new UserSchema({
    userId: {
        type: Number,
        unique: true
    },
    userName: String,
    emailAddr: String
});

var UserModel = mongoose.model('UserModel', userModelSchema);

module.exports = UserModel;