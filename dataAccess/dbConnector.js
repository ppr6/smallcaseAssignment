const mongoose = require('mongoose');
const config = require('../config/config');

var mongoDB = config.db.url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

var db = mongoose.connection;

db.on('error', (err) => {
    console.log(`MongoDB connection error: ${err}`);
});