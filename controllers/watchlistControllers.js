//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
const axios = require('axios')
const Watchlist = require('../models/watchlist')


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

        res.render('watchlists/show', { watchlist, signedIn, username });
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

// GET -> add movie to watchlist with id
router.get('/:watchlistId/add-movie/:movieId', async (req, res) => {
    const { watchlistId, movieId } = req.params;

    try {
        // Get the watchlist by ID and update its movies array with the new movie ID
        const watchlist = await Watchlist.findById(watchlistId);
        watchlist.movies.push(movieId);
        await watchlist.save();

        // Redirect the user back to the watchlist or movie page or send a success response
        res.redirect(`/watchlists/${watchlistId}`);
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
        res.status(500).send('Error adding movie to watchlist');
    }
})

// POST -> /watchlists -> create a new watchlist
router.post('/', async (req, res) => {
    const { name } = req.body; // Change 'title' to 'name' if that's the field name
    try {
        const newWatchlist = await Watchlist.create({ title: name }); // Ensure the field name matches your model
        const watchlists = await Watchlist.find(); // Fetch all watchlists after creating a new one
        const signedIn = req.session.signedIn;
        const username = req.session.username;
        res.render('watchlists/index', { watchlists, signedIn, username }); // Pass watchlists data to index view
    } catch (error) {
        console.error(error);
        res.render('watchlists/new', { error: 'Error creating watchlist' });
    }
})

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router