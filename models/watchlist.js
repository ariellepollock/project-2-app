//+//+//+//+//+//+//+//+//+//+//+//
//+//  Schema + dependencies  //+//
//+//+//+//+//+//+//+//+//+//+//+//
const mongoose = require('../utils/connection')

// destructure
const { Schema, model } = mongoose

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Schema definition      //+//
//+//+//+//+//+//+//+//+//+//+//+//
const movieSchema = new Schema({
    title: String,
})

const watchlistSchema = new Schema ({
    title: {
        type: String,
        required: true,
    },
    movies: [movieSchema],
})

//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create watchlist model    //+//
//+//+//+//+//+//+//+//+//+//+//+//+//
const Watchlist = model('Watchlist', watchlistSchema)

//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export watchlist model    //+//
//+//+//+//+//+//+//+//+//+//+//+//+//
module.exports = Watchlist