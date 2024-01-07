//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
const axios = require('axios')


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
        IMAGE_API_BASE_URL = tmdbConfig.images.secure_base_url
    } catch (error) {
        throw new Error('Error fetching configuration:', error);
    }
}

// fetch configuration when server starts
fetchConfiguration()


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes + Controllers   //+//
//+//+//+//+//+//+//+//+//+//+//+//

// GET -> /movies/popular -> get popular movies for index
router.get('/popular', async (req, res) => {
    const { username, signedIn, userId } = req.session
    try {
        const apiKey = process.env.API_KEY
        const apiUrl = `${process.env.DISCOVER_MOVIES_API_URL}&api_key=${apiKey}` // append api key to url

        // make api request with axios
        const apiRes = await axios.get(apiUrl)
        const movies = apiRes.data.results

        // constructing image URLs for each movie
        const IMAGE_API_BASE_URL = tmdbConfig.images.base_url
        const DEFAULT_POSTER_URL = '/assets/no_poster_image.png'

        const moviesWithImageUrls = movies.map(movie => ({
            ...movie,
            posterUrl: movie.poster_path ? `${IMAGE_API_BASE_URL}/w500/${movie.poster_path}` : DEFAULT_POSTER_URL,
        }))

        // apiRes.data.results is an array of movie objects
        // res.send(apiRes.data.results)
        res.render('movies/index', { movies: moviesWithImageUrls, username, signedIn, userId, error: null })
    } catch (error) {
        console.error(error)
        res.render('movies/index', { movies: [], username, signedIn, userId, error: 'Error fetching popular movies' })
    }
})

// GET -> /movies/search - search for movies
router.get('/search', async (req, res) => {
    const { username, signedIn, userId } = req.session
    const { query } = req.query

    try {
        if (query === undefined) {
            // Check if the query parameter is undefined (likely due to a page refresh)
            res.render('movies/index', { movies: [], username, signedIn, userId, error: null })
            return;
        }

        if (!tmdbConfig) {
            // If configuration is not available, wait and retry after a short delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!tmdbConfig) {
            throw new Error('TMDb configuration is not available');
        }

        // use search endpoint with query
        const apiKey = process.env.API_KEY
        const apiUrl = `${process.env.SEARCH_MOVIES_API_URL}?query=${query}&api_key=${apiKey}`

        // make api request with axios
        const apiRes = await axios.get(apiUrl)
        const movies = apiRes.data.results

        if (movies.length === 0) {
            // if no results found, render search page without results
            res.render('movies/index', { movies: [], username, signedIn, userId, error: 'Sorry, no results found for your query' })
        } else {
            // constructing image URLs for each movie
            const IMAGE_API_BASE_URL = tmdbConfig.images.secure_base_url
            const DEFAULT_POSTER_URL = '/assets/no_poster_image.png'

            const moviesWithImageUrls = movies.map(movie => {
                const posterUrl = movie.poster_path ? `${IMAGE_API_BASE_URL}/w500/${movie.poster_path}` : DEFAULT_POSTER_URL
                return {
                    ...movie,
                    posterUrl,
                }
            })

            res.render('movies/index', { movies: moviesWithImageUrls, username, signedIn, userId, error: null })
        }
    } catch (error) {
        console.error('Error searching for movies:', error)
        res.render('movies/index', { movies: [], username, signedIn, userId, error: 'Error searching for movies' })
    }
})

// GET -> /movies/:id -> get details for a specific movie
router.get('/:id', async (req, res) => {
    const { username, signedIn, userId } = req.session
    const movieId = req.params.id

    try {
        if (!movieId) {
            res.render('error', { message: 'No movie ID provided', signedIn })
            return
        }

        // fetch details for specific movie using TMDb
        const apiKey = process.env.API_KEY
        const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`

        const response = await axios.get(movieDetailsUrl)
        const movieDetails = response.data

        // constructing movie object with details
        const movie = {
            title: movieDetails.title,
            posterUrl: movieDetails.poster_path ? `${IMAGE_API_BASE_URL}/w500/${movieDetails.poster_path}` : DEFAULT_POSTER_URL,
            releaseYear: movieDetails.release_date ? movieDetails.release_date.slice(0, 4) : 'N/A',
            genres: movieDetails.genres.map(genre => genre.name).join(', '),
            overview: movieDetails.overview || 'No overview available',
        }

        res.render('movies/show', { movie, username, signedIn, userId })
    } catch (error) {
        console.error('Error fetching movie details', error)
        res.render('error', { error: 'Error fetching movie details', signedIn, username })
    }
})


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router