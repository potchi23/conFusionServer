const express = require('express');
const router = express.Router();
const Users = require('../models/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
    Users.findOne({username : req.body.username})
    .then((user) => {
        if(user != null){
            let err = new Error('User ' + req.body.username + ' already exists');
            err.status = 403;
            next(err);
        }
        else{
            return Users.create({
                username : req.body.username,
                password : req.body.password
            });
        }
    })
    .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({status : 'Registration Successful!', user : user});
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.post('/login', (req, res, next) => {
    if(!req.session.user){
        let authHeader = req.headers.authorization;

        if(!authHeader){
            let err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }

        let auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

        let username = auth[0];
        let password = auth[1];

        Users.findOne({username : username})
        .then((user) => {
            if(user === null){
                let err = new Error('You are not authenticated');
                res.setHeader('WWW-Authenticate', 'Basic');
                err.status = 401;
                return next(err);
            }
            else if(user.password !== password){
                let err = new Error('Your password is incorrect');
                res.setHeader('WWW-Authenticate', 'Basic');
                err.status = 403;
                return next(err);
            }
            else if(user.username === username && user.password === password){
                req.session.user = 'authenticated';
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You are authenticated');
            }
        })
        .catch((err) => next(err));
    }
    else{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated');
    }
});

router.get('/logout', (req, res, next) => {
    if(req.session){
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }
    else{
        let err = new Error('You are not logged in');
        err.status = 403;
        next(err);
    }
});

module.exports = router;
