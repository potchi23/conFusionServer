const express = require('express');
const favoriteRouter = express.Router();
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors.js');

favoriteRouter.use(express.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({userId : req.user._id})
    .populate('userId')
    .populate('dishes.dishId')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    Favorites.findOne({ userId : req.user._id })
    .then((favorites) => {
        if(favorites == null){
            Favorites.create({userId : req.user._id, dishes : req.body.dishes})
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            for(let i = 0; i < req.body.dishes.length; i++){
                
                Favorites.findOne({ userId : req.user._id, "dishes.dishId" : req.body.dishes[i].dishId })
                .then((dish) => {
                    if(dish == null){
                        favorites.dishes.push({ dishId : req.body.dishes[i].dishId});
                        favorites.save()
                        .then(() => {
                            res.statusCode = 200;
                        })
                        .catch((err) => next(err));
                    }
       
                }, (err) => next(err))
                .catch((err) => next(err));
            }

            res.setHeader('Content-Type', 'application/text');
            res.send('Dishes added');

        }
    }, (err) => next(err))
    .catch((err) => next(err));

}).
put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode=403;
    res.end('PUT operation not supported on /favorites');
}).
delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    Favorites.findOne({ userId : req.user._id })
    .then((favorite) =>{
        if(favorite != null){
            Favorites.deleteMany({})
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            next();
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:favoriteId')
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.favoriteId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Favorites.findOne({ userId : req.user._id })
    .then((favorites) => {
        if(favorites == null){
            Favorites.create({userId : req.user._id, dishes : [{dishId : req.params.favoriteId}]})
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch((err) => next(err));
        }
        else{
            Favorites.findOne({ "dishes.dishId" : req.params.favoriteId })
            .then((dish) => {
                if(dish == null){
                    favorites.dishes.push({dishId : req.params.favoriteId});
                    favorites.save()
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    });
                }
                else{
                    err = new Error('Dish already in favorites');
                    err.statusCode = 500;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.favoriteId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{

    Favorites.findOneAndUpdate({userId : req.user._id}, {$pull: {dishes: {dishId: req.params.favoriteId}}})
    .then((favorite) =>{
        if(favorite.dishes.length > 0){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/text');
            res.send('Dish '+ req.params.favoriteId + ' deleted');
        }
        else{
            err = new Error("This dish does not exist");
            err.statusCode = 500;
            return next(err);
        }
    })
    .catch((err) => next(err));
});

module.exports = favoriteRouter;