const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');
const authenticate = require('../authenticate');

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
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

router.post('/signup', async (req, res, next) => {

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

router.post('/login', passport.authenticate('local'), (req, res, next) => {
    const token = authenticate.getToken({_id : req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success : true, token : token, status : 'You are logged in!'});
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
