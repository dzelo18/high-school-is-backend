const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookie_parser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

//const crypto = require('crypto');
//console.log(crypto.randomBytes(64).toString('hex'));

var authenticationController = require('./controllers/AuthenticationController.js');

var student = require('./routes/student.js');
var teacher = require('./routes/teacher.js');
var auth = require('./routes/auth.js');

const app = express();

// Middlewares + Features
app.use(express.json());
app.use(cookie_parser());
app.use(express.urlencoded());
app.use(cors({ origin: true, credentials: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

let secret = process.env.TOKEN_SECRET;

//Routes
app.use('/students', authenticationController.authorizeRequest, student);
app.use('/teachers', teacher);
app.use('/auth', auth);

const port = process.env.PORT || 4500;

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

module.exports = app
