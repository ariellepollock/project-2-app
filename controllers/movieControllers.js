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


//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Fetch TMDb Configuration  //+//
//+//+//+//+//+//+//+//+//+//+//+//+//
let tmdbConfig
let IMAGE_API_BASE_URL = ''

const fetchConfiguration = async () => {
    try {
        const apiKey = process.env.API_KEY;
        const response = await axios.get(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`);
        tmdbConfig = response.data;
        IMAGE_API_BASE_URL = tmdbConfig.images.secure_base_url;
    } catch (error) {
        console.error('Error fetching configuration:', error);
        throw error;
    }
};

// fetch configuration when server starts
fetchConfiguration()


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes + Controllers   //+//
//+//+//+//+//+//+//+//+//+//+//+//

router.get('/popular', async (req, res) => {
    try {
        const apiKey = process.env.API_KEY;
        const apiUrl = `${process.env.DISCOVER_MOVIES_API_URL}&api_key=${apiKey}`;
        const apiRes = await axios.get(apiUrl);
        const movies = apiRes.data.results;

        // Construct image URLs for each movie
        const DEFAULT_POSTER_URL = '/assets/no_poster_image.png';
        const moviesWithImageUrls = movies.map(movie => ({
            ...movie,
            posterUrl: movie.poster_path ? `${IMAGE_API_BASE_URL}/w500/${movie.poster_path}` : DEFAULT_POSTER_URL,
        }));

        // Fetch the user's watchlists
        const userId = req.session.userId;
        const watchlists = await Watchlist.find({ userId });

        res.render('movies/index', {
            movies: moviesWithImageUrls,
            username: req.session.username,
            signedIn: req.session.signedIn,
            userId,
            watchlists,
            error: null,
        });
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        res.render('movies/index', {
            movies: [],
            username: req.session.username,
            signedIn: req.session.signedIn,
            userId: req.session.userId,
            watchlists: [],
            error: 'Error fetching popular movies',
        });
    }
});

// GET -> /movies/search - search for movies
router.get('/search', async (req, res) => {
    const query = req.query.query;

    try {
        if (!query) {
            return res.render('movies/index', {
                movies: [],
                username: req.session.username,
                signedIn: req.session.signedIn,
                userId: req.session.userId,
                error: null,
            });
        }

        if (!tmdbConfig) {
            // If configuration is not available, wait and retry after a short delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!tmdbConfig) {
            throw new Error('TMDb configuration is not available');
        }

        const apiKey = process.env.API_KEY;
        const apiUrl = `${process.env.SEARCH_MOVIES_API_URL}?query=${query}&api_key=${apiKey}`;
        const apiRes = await axios.get(apiUrl);
        const movies = apiRes.data.results;

        if (movies.length === 0) {
            return res.render('movies/index', {
                movies: [],
                username: req.session.username,
                signedIn: req.session.signedIn,
                userId: req.session.userId,
                error: 'Sorry, no results found for your query',
            });
        }

        const DEFAULT_POSTER_URL = '/assets/no_poster_image.png';
        const moviesWithImageUrls = movies.map(movie => ({
            ...movie,
            posterUrl: movie.poster_path ? `${IMAGE_API_BASE_URL}/w500/${movie.poster_path}` : DEFAULT_POSTER_URL,
        }));

        const userId = req.session.userId;
        const watchlists = await Watchlist.find({ userId });

        res.render('movies/index', {
            movies: moviesWithImageUrls,
            username: req.session.username,
            signedIn: req.session.signedIn,
            userId,
            watchlists,
            error: null,
        });
    } catch (error) {
        console.error('Error searching for movies:', error);
        const userId = req.session.userId;
        const watchlists = await Watchlist.find({ userId });

        res.render('movies/index', {
            movies: [],
            username: req.session.username,
            signedIn: req.session.signedIn,
            userId,
            watchlists,
            error: 'Error searching for movies',
        });
    }
});

// POST -> /movies/add-to-watchlist/:movieId -> add a movie to a watchlist
router.post('/add-to-watchlist/:movieId', async (req, res) => {
    const { movieId } = req.params;
    const { watchlistId } = req.body;

    try {
        const watchlist = await Watchlist.findById(watchlistId);
        if (!watchlist) {
            return res.render('error', { error: 'Watchlist not found' });
        }

        const existingMovie = watchlist.movies.find(movie => movie._id === movieId);
        if (existingMovie) {
            return res.render('error', { error: 'Movie already exists in the watchlist' });
        }

        watchlist.movies.push({ _id: movieId });
        await watchlist.save();

        res.redirect(`/movies/${movieId}`);
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
        res.render('error', { error: 'Error adding movie to watchlist' });
    }
});

// GET -> /movies/:id -> get details for a specific movie
router.get('/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        if (!movieId) {
            return res.render('error', { error: 'No movie ID provided', signedIn: req.session.signedIn });
        }

        const apiKey = process.env.API_KEY;
        const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
        const response = await axios.get(movieDetailsUrl);
        const movieDetails = response.data;

        const DEFAULT_POSTER_URL = '/assets/no_poster_image.png';

        const movie = {
            title: movieDetails.title,
            posterUrl: movieDetails.poster_path ? `${IMAGE_API_BASE_URL}/w500/${movieDetails.poster_path}` : DEFAULT_POSTER_URL,
            releaseYear: movieDetails.release_date ? movieDetails.release_date.slice(0, 4) : 'N/A',
            genres: movieDetails.genres.map(genre => genre.name).join(', '),
            overview: movieDetails.overview || 'No overview available',
        };

        const userId = req.session.userId;
        const watchlists = await Watchlist.find({ userId });

        res.render('movies/show', { movie, username: req.session.username, signedIn: req.session.signedIn, userId, watchlists });
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.render('error', { error: 'Error fetching movie details', signedIn: req.session.signedIn, username: req.session.username });
    }
});


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router