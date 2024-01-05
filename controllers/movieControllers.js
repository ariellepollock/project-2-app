//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
const axios = require('axios')


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
const router = express.Router()


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes + Controllers   //+//
//+//+//+//+//+//+//+//+//+//+//+//
// Function to fetch TMDb configuration
const fetchConfiguration = async () => {
    try {
        const apiKey = process.env.API_KEY;
        const response = await axios.get(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching configuration:', error);
    }
}

// GET -> /movies/discover -> get movies for index
router.get('/discover', async (req, res) => {
    const { username, signedIn, userId } = req.session
    try {
        // Fetch TMDb configuration
        const tmdbConfig = await fetchConfiguration()

        const apiKey = process.env.API_KEY
        const apiUrl = `${process.env.DISCOVER_MOVIES_API_URL}&api_key=${apiKey}` // append api key to url

        // make api request with axios
        const apiRes = await axios.get(apiUrl)
        const movies = apiRes.data.results

        // constructing image URLs for each movie
        const IMAGE_API_BASE_URL = tmdbConfig.images.base_url
        const moviesWithImageUrls = movies.map(movie => ({
            ...movie,
            posterUrl: movie.poster_path ? `${IMAGE_API_BASE_URL}/w500/${movie.poster_path}` : 'path_to_default_image_if_no_poster_available',
        }))

        // apiRes.data.results is an array of movie objects
        // res.send(apiRes.data.results)
        res.render('movies/index', { movies: moviesWithImageUrls, username, signedIn, userId })
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Error fetching movies' })
    }
})


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router