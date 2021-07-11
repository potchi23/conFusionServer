const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const favoriteDishes = new Schema(
    {
        dishId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Dish'
        }
    }
);

const favoriteSchema = new Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        },

        dishes : [favoriteDishes]
    },
    {
        timestamps : true
    }
);

let Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;