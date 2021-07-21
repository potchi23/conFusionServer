const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
    //Using 'async-await' way of writing code, instead of promises (much cleaner in my opinion)
    try{
        let users = await User.find({});

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    }

    catch(err){
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err : err});
    }
});

router.post('/signup', cors.corsWithOptions, async (req, res, next) => {

    //Something new I wanted to try with async-await
    try{
        let user = await User.register(new User({username : req.body.username}), req.body.password);
        if(req.body.firstname){
            user.firstname = req.body.firstname;
        }
        if(req.body.lastname){
            user.lastname = req.body.lastname;
        }

        user.save((err, user) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err : err});
            }
            else{
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success : true, status : 'Registration Successful!'});
                });
            }
        });
    } 
    
    catch(err){
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err : err});
    }

});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
    if(req.user){
        let token = authenticate.getToken({_id : req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success : true, token : token, status : 'You are logged in!'});
    }
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {

    passport.authenticate('local', (err, user, info) =>{
        if(err){
            return next(err);
        }
        if(!user){
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({success : false, status : 'Login unsuccessful', err: info});
        }
        req.logIn(user, (err) => {
            if(err){
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({success : false, status : 'Login unsuccessful', err: 'Could not log in user'});
            }

            let token = authenticate.getToken({_id : req.user._id});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success : true, status : 'Login successful', token:token});
        });
    }) (req,res, next);
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
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

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if(err){
            return next(err);
        }
        if(!user){
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT invalid', success: false, err: info});
        }   
        else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT valid', success: true, user: user});
        }
    }) (req, res);
});

module.exports = router;
