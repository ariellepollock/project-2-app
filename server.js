//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
require('dotenv').config()
const path = require('path')
const middleware = require('./utils/middleware')

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Routers         //+//
//+//+//+//+//+//+//+//+//+//+//+//
const UserRouter = require('./controllers/userControllers')

//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create the app object + view engine   //+//
//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//+//
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Middleware             //+//
//+//+//+//+//+//+//+//+//+//+//+//
middleware(app)

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes                 //+//
//+//+//+//+//+//+//+//+//+//+//+//
app.get('/', (req, res) => {
    const { username, signedIn, userId } = req.session
    res.render('home.ejs', { username, signedIn, userId })
})

app.use('/users', UserRouter)

// error page
app.get('/error', (req, res) => {
    const error = req.query.error || 'This page does not exist'
    
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