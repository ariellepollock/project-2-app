//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
const Watchlist = require('../models/watchlist')


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
const router = express.Router()


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes + Controllers   //+//
//+//+//+//+//+//+//+//+//+//+//+//
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
        const watchlist = await Watchlist.findById(id).populate('movies')
        const signedIn = req.session.signedIn
        res.render('watchlists/show', { watchlist, signedIn });
    } catch (error) {
        console.error(error);
        res.render('watchlists/show', { watchlist: null, error: 'Error fetching watchlist details', signedIn: false });
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