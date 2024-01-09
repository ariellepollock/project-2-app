//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
const axios = require('axios')
const {Watchlist} = require('../models/watchlist')


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
const router = express.Router()


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes + Controllers   //+//
//+//+//+//+//+//+//+//+//+//+//+//
// Function to fetch movies from TMDb API
const fetchMovies = async (query) => {
    try {
        const apiKey = process.env.TMDB_API_KEY; // Access your API key from environment variables
        const apiUrl = 'https://api.themoviedb.org/3/search/movie'; // TMDb API endpoint

        const response = await axios.get(apiUrl, {
            params: {
                api_key: apiKey,
                query: query, // Your search query or category
            },
        });

        return response.data.results; // Return the movies array from the API response
    } catch (error) {
        console.error('Error fetching movies:', error);
        return []; // Return an empty array in case of an error
    }
};

// GET -> /watchlists/mine – display watchlist index
router.get('/mine', async (req, res) => {
    const signedIn = req.session.signedIn
    const username = req.session.username

    try {
        const watchlists = await Watchlist.find()
        res.render('watchlists/index', { watchlists, signedIn, username })
    } catch (error) {
        console.error(error)
        res.render('watchlists/index', { watchlists: [], error: 'Error fetching watchlists' })
    }
})

// GET -> /watchlists/new -> display form to create new watchlist
router.get('/new', (req, res) => {
    const signedIn = req.session.signedIn
    const username = req.session.username
    res.render('watchlists/new', { signedIn, username })
})

// GET -> /watchlists/:id -> display watchlist show page
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const watchlist = await Watchlist.findById(id).populate('movies');
        const signedIn = req.session.signedIn;
        const username = req.session.username;
        const userId = req.session.userId

        res.render('watchlists/show', { watchlist, signedIn, username, userId });
    } catch (error) {
        console.error(error);
        res.render('watchlists/show', { watchlist: null, error: 'Error fetching watchlist details', signedIn: false, username: null });
    }
})

// POST -> /watchlists/:id/add-movie -> add a movie to a watchlist
router.post('/:id/add-movie', async (req, res) => {
    const { id } = req.params;
    const { movieId, movieTitle } = req.body;

    try {
        const watchlist = await Watchlist.findById(id);
        if (!watchlist) {
            return res.render('watchlists/show', { watchlist: null, error: 'Watchlist not found' });
        }

        // Add the movie to the watchlist with its ID and title
        watchlist.movies.push({
            _id: movieId,
            title: movieTitle,
            // Add other movie details if needed
        });

        await watchlist.save();

        // Redirect to the view watchlist page after adding the movie
        res.redirect(`/watchlists/${id}`);
    } catch (error) {
        console.error(error);
        res.render('watchlists/show', { watchlist: null, error: 'Error adding movie to watchlist' });
    }
})

// POST -> /watchlists -> create a new watchlist
router.post('/', async (req, res) => {
    const { name } = req.body; // Change 'title' to 'name' if that's the field name
    const username = req.session.username;
    const userId = req.session.userId;
    try {
        const newWatchlist = await Watchlist.create({ title: name, owner: userId }); // Ensure the field name matches your model
        const watchlists = await Watchlist.find(); // Fetch all watchlists after creating a new one
        const signedIn = req.session.signedIn;
        res.render('watchlists/index', { watchlists, signedIn, username }); // Pass watchlists data to index view
    } catch (error) {
        console.error(error);
        res.render('watchlists/new', { error: 'Error creating watchlist' });
    }
})

// UPDATE -> /watchlist/update/:id
router.put('/update/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session
    // target the specific watchlist
    const watchlistId = req.params.id
    const theUpdatedList = req.body

    // sometimes mean hackers try to steal stuff
    // remove the ownership from req.body(even if it isn't sent)
    // then reassign using the session info
    delete theUpdatedList.owner
    theUpdatedList.owner = userId

    // default value for a checked checkbox is 'on'
    // this line of code converts that two times
    // which results in a boolean value

    theUpdatedList.title = !!theUpdatedList.title

    console.log('this is req.body', theUpdatedList)
    // find the place
    Watchlist.findById(watchlistId)
        // check for authorization(aka ownership)
        // if they are the owner, allow update and refresh the page
        .then(foundList => {
            // determine if loggedIn user is authorized to update this(aka, the owner)
            if (foundList.owner == userId) {
                // here is where we update
                return foundList.updateOne(theUpdatedList)
            } else {
                // if the loggedIn user is NOT the owner
                res.redirect(`/error?error=You%20Are%20Not%20Allowed%20To%20Update%20This%20List`)
            }
        })
        .then(returnedList => {
            res.redirect(`/pokemon/captured/${watchlistId}`)
        })
        // if not, send error
        .catch(err => {
            console.log('error')
            res.redirect(`/error?error=${err}`)
        })
})

// DELETE -> /watchlists/delete/:id
// Remove watchlist from a user's watchlists, and is only available to authorized user
router.delete('/delete/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session
    // target the specific place
    const watchlistId = req.params.id
    // find it in the database
    Watchlist.findById(watchlistId)
        // delete it 
        .then(watchlist => {
            // determine if loggedIn user is authorized to delete this(aka, the owner)
            if (watchlist.owner == userId) {
                // here is where we delete
                return watchlist.deleteOne()
            } else {
                // if the loggedIn user is NOT the owner
                res.redirect(`/error?error=You%20Are%20Not%20Allowed%20to%20Delete%20this%20Watchlist`)
            }
        })
        // redirect to another page
        .then(deletedList => {
            console.log('this was returned from deleteOne', deletedList)
            res.redirect('watchlists/mine')
        })
        // if err -> send to err page
        .catch(err => {
            console.log('error')
            res.redirect(`/error?error=${err}`)
        })
})

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router