const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.cookies.token_auth;
    const tokenProvider = req.cookies.token_provider;

    if (!token || !tokenProvider) {
        next();
    } else {
        jwt.verify(token, process.env.KEY_AUTH, (err, decoded) => {
            if (err) {
                console.error('Error verifying JWT token:', err);
                req.session.message = 'Error verifying JWT token';
                return res.status(404).redirect('/error');
            }
            res.redirect('/')
        });
    }
};