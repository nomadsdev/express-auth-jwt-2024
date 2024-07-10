const express = require('express');
const router = express.Router();
const connectMysql = require('../lib/mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken() {
    const randomString = Math.random().toString(36).substring(2, 12).toUpperCase();
    return randomString;
};

router.post('/register', async (req, res) => {
    const { name, username, email, password, confirmPassword  } = req.body;

    if (password !== confirmPassword) {
        req.session.message = 'Passwords do not match';
        return res.redirect('/register');
    }

    connectMysql.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, results) => {
        if (err) {
            req.session.message = 'Error occurred during registration';
            return res.redirect('/register');
        }

        if (results.length > 0) {
            req.session.message = 'User already exists';
            return res.redirect('/register');
        }

        const token = generateToken();
        const hashedPassword = await bcrypt.hash(password, 10);

        connectMysql.query('INSERT INTO users (name, username, email, password, token) VALUES (?, ?, ?, ?, ?)', [name, username, email, hashedPassword, token], (err, results) => {
            if (err) {
                req.session.message = 'Error occurred during registration';
                return res.redirect('/register');
            }

            res.redirect('/login')
        });
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    connectMysql.query(query, [email], async (err, result) => {
        if (err) {
            console.error(err);
            req.session.message = 'Internal Server Error';
            return res.redirect('/login');
        }
        if (result.length === 0) {
            req.session.message = 'Invalid email or password';
            return res.redirect('/login');
        }
        
        const user = result[0];

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            req.session.message = 'Invalid email or password';
            return res.redirect('/login');
        }
        
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.KEY_AUTH, { expiresIn: '1h' });
        res.cookie('token_auth', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('token_provider', user.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.redirect('/');
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token_auth');
    res.clearCookie('token_provider');
    res.redirect('/login');
});

module.exports = router;