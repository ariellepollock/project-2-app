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
    movieId: Number,
    status: {
        type: String,
        enum: ['option1', 'option2', 'option3', 'option4', 'option5', 'option6', 'option7'],
        default: 'option1'
    }
})

const watchlistSchema = new Schema ({
    title: {
        type: String,
        required: true,
    },
    movies: [movieSchema],
    owner: { type: Schema.Types.ObjectId, required: true }
})

//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create watchlist model    //+//
//+//+//+//+//+//+//+//+//+//+//+//+//
const Watchlist = model('Watchlist', watchlistSchema)
const Movie = model('Movie', movieSchema)

//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export watchlist model    //+//
//+//+//+//+//+//+//+//+//+//+//+//+//
module.exports = {Watchlist, Movie}
