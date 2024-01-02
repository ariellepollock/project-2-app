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
    res.send('the app is connected')
})

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Server Listener        //+//
//+//+//+//+//+//+//+//+//+//+//+//
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log('server is running, go catch it')
})

// End