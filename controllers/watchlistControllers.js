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
    const { userId } = req.session

    if (!userId) {
        return res.redirect('/signin')
    }

    try {
        const watchlists = await Watchlist.find({ owner: userId })
        res.render('watchlists/index', { watchlists, signedIn: req.session.signedIn, username: req.session.username })
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

// // POST -> /watchlists/:id/add-movie -> add a movie to a watchlist
// router.post('/:id/add-movie', async (req, res) => {
//     const { id } = req.params
//     const { movieId, movieTitle } = req.body

//     try {
//         const watchlist = await Watchlist.findById(id)
//         if (!watchlist) {
//             return res.render('watchlists/show', { watchlist: null, error: 'Watchlist not found' })
//         }

//         // Add the movie to the watchlist with its ID and title
//         watchlist.movies.push({
//             _id: movieId,
//             title: movieTitle,
//             // Add other movie details if needed
//         })

//         await watchlist.save()

//         // Redirect to the view watchlist page after adding the movie
//         res.redirect(`/watchlists/${id}`)
//     } catch (error) {
//         console.error(error)
//         res.render('watchlists/show', { watchlist: null, error: 'Error adding movie to watchlist' })
//     }
// })

// POST -> /watchlists -> create a new watchlist
router.post('/', async (req, res) => {
    const { name } = req.body; // Assuming 'name' is the correct field from your form
    const userId = req.session.userId;
    
    if (!userId) {
        // Redirect to the sign-in page if the user is not signed in
        return res.redirect('/signin'); // Ensure this is the correct route for your sign-in page
    }
    
    try {
        // Create the new watchlist with the provided name and the current user's ID as the owner
        await Watchlist.create({ title: name, owner: userId });

        // Redirect to the user's own watchlists page after successful creation
        res.redirect('/watchlists/mine');
    } catch (error) {
        console.error('Error creating watchlist:', error);
        // Render the watchlist creation page again with an error message if there's an error
        res.render('watchlists/new', { error: 'Error creating watchlist', signedIn: true, username: req.session.username });
    }
})

// UPDATE -> /watchlist/update/:id
router.post('/update/:id', async (req, res) => {
    const { userId } = req.session;
    const watchlistId = req.params.id;
    const { name } = req.body;

    if (!userId) {
        return res.redirect('/signin');
    }

    try {
        const watchlist = await Watchlist.findById(watchlistId);
        if (!watchlist) {
            return res.status(404).send('Watchlist not found');
        }

        if (watchlist.owner.toString() !== userId) {
            return res.status(403).send('Not authorized to update this watchlist');
        }

        watchlist.title = name;
        await watchlist.save();
        res.redirect(`/watchlists/${watchlistId}`);
    } catch (error) {
        console.error('Error updating watchlist:', error);
        res.redirect(`/error?error=${encodeURIComponent(error.message)}`);
    }
})

// DELETE -> /watchlists/:watchlistId/remove-movie/:movieId
router.post('/:watchlistId/remove-movie/:movieId', async (req, res) => {
    const { watchlistId, movieId } = req.params;
    const userId = req.session.userId;

    try {
        // Ensure only the watchlist owner can remove a movie
        const watchlist = await Watchlist.findById(watchlistId);
        if (!watchlist) {
            return res.status(404).send('Watchlist not found');
        }

        if (watchlist.owner.toString() !== userId.toString()) {
            return res.status(403).send('You are not authorized to modify this watchlist');
        }

        // Remove the movie from the watchlist
        watchlist.movies = watchlist.movies.filter(movie => movie._id.toString() !== movieId);
        await watchlist.save();

        res.redirect(`/watchlists/${watchlistId}`);
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).send('An error occurred while removing the movie from the watchlist');
    }
});


// DELETE -> /watchlists/delete/:id
// Remove watchlist from a user's watchlists, and is only available to authorized user
router.post('/delete/:id', (req, res) => {
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
            res.redirect('/watchlists/mine')
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