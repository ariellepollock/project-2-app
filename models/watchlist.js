//+//+//+//+//+//+//+//+//+//+//+//
//+//  Schema + dependencies  //+//
//+//+//+//+//+//+//+//+//+//+//+//
const mongoose = require('../utils/connection')

// destructure
const { Schema, model } = mongoose

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Schema definition      //+//
//+//+//+//+//+//+//+//+//+//+//+//
const watchlistSchema = new Schema ({
    title: {
        type: String,
        required: true,
    },
    movies: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        },
    ],
})

//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create watchlist model    //+//
//+//+//+//+//+//+//+//+//+//+//+//+//
const Watchlist = model('Watchlist', watchlistSchema)

//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export watchlist model    //+//
//+//+//+//+//+//+//+//+//+//+//+//+//
module.exports = Watchlist