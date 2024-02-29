//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
require('dotenv').config()
const path = require('path')
const middleware = require('./utils/middleware')
const axios = require('axios')

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Routers         //+//
//+//+//+//+//+//+//+//+//+//+//+//
const UserRouter = require('./controllers/userControllers')
const MovieRouter = require('./controllers/movieControllers')
const WatchlistRouter = require('./controllers/watchlistControllers')

//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create the app object + view engine   //+//
//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//
const app = express()

// view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Middleware             //+//
//+//+//+//+//+//+//+//+//+//+//+//
middleware(app)

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes                 //+//
//+//+//+//+//+//+//+//+//+//+//+//
app.get('/', async (req, res) => {
    try {
        const { username, signedIn, userId } = req.session;
        const apiKey = process.env.API_KEY;
        const apiUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`;

        const response = await axios.get(apiUrl);
        const movies = response.data.results;

        const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
        const moviesWithImages = movies.map(movie => ({
            ...movie,
            posterUrl: movie.poster_path ? `${imageBaseUrl}/${movie.poster_path}` : '/path/to/default/image.jpg',
        }));

        res.render('home.ejs', {
            username,
            signedIn,
            userId,
            movies: moviesWithImages,
            error: null, // Include error variable, set to null because there's no error
        });
    } catch (error) {
        console.error('Error fetching movies for the home page:', error);
        // Now also include the error variable here, with an actual error message
        res.render('home.ejs', {
            username,
            signedIn,
            userId,
            movies: [],
            error: 'Failed to load movies', // Pass the error message to the view
        });
    }
})

app.use('/users', UserRouter)
app.use('/movies', MovieRouter)
app.use('/watchlists', WatchlistRouter)

// error page
app.get('/error', (req, res) => {
    const error = req.query.error || 'Something went wrong...try again'
    
    const { username, signedIn, userId } = req.session
    res.render('error.ejs', { error, userId, username, signedIn })
})

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Server Listener        //+//
//+//+//+//+//+//+//+//+//+//+//+//
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log('server is running, go catch it')
})

// End