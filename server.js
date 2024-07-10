const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.PASS_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const router = require('./router/main');
const auth = require('./api/auth');

app.use('/', router);
app.use('/api/auth', auth);
app.use((req, res, next) => {
    const message = req.session.message;
    req.session.message = null;
    res.status(404).render('error', { title: 'ERROR', message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});