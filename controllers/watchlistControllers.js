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
    try {
        const watchlists = await Watchlist.find()
        res.render('watchlists/index', { watchlists })
    } catch (error) {
        console.error(error)
        res.render('watchlists/index', { watchlists: [], error: 'Error fetching watchlists' })
    }
})

// GET -> /watchlists/:id -> display watchlist show page
router.get('/:d', async (req, res) => {
    const { id } = req.params
    try {
        const watchlist = await Watchlist.findById(id).populate('movies')
        res.render('watchlists/show', { watchlist })
    } catch (error) {
        console.error(error)
        res.render('watchlists/show', { watchlist: null, error: 'Error fetching watchlist details' })
    }
})

// GET -> /watchlists/new -> display form to create new watchlist
router.get('/new', (req, res) => {
    res.render('watchlists/new')
})

// POST -> /watchlists -> create a new watchlist
router.post('/', async (req, res) => {
    const { title } = req.body
    try {
        const newWatchlist = await Watchlist.create({ title })
        res.redirect(`/watchlists/${newWatchlist._id}`)
    } catch (error) {
        console.error(error)
        res.render('watchlists/new', { error: 'Error creating watchlist' })
    }
})

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router