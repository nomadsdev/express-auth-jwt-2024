const express = require('express');
const router = express.Router();

const token_provider = require('../middleware/token_provider');
const authenticate = require('../middleware/authenticate');

router.get('/', token_provider, (req, res) => {
    res.render('index', { title: 'Home', user: req.user });
});
router.get('/login', authenticate, (req, res) => {
    const message = req.session.message;
    req.session.message = null;
    res.render('login', { title: 'Login', message, user: req.user });
});
router.get('/register', authenticate, (req, res) => {
    const message = req.session.message;
    req.session.message = null;
    res.render('register', { title: 'Sign Up', message, user: req.user });
});

module.exports = router;