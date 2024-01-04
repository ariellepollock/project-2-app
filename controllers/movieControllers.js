//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
const axios = require('axios')
const discoverMoviesUrl = process.env.DISCOVER_MOVIES_API_URL


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
const router = express.Router()


//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes + Controllers   //+//
//+//+//+//+//+//+//+//+//+//+//+//

// GET -> /movies/discover – discover movies based on certain criteria
router.get('/discover', async (req, res) => {
    try {
        const apiKey = process.env.API_KEY
        const apiUrl = `${process.env.DISCOVER_MOVIES_API_URL}&api_key=${apiKey}`

        // make api request with axios
        const apiRes = await axios.get(apiUrl)
        res.send(apiRes.data)
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Error fetching movies' })
    }
})

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router