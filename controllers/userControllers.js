//+//+//+//+//+//+//+//+//+//+//+//
//+//  Import Dependencies    //+//
//+//+//+//+//+//+//+//+//+//+//+//
const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Create Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
const router = express.Router()

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Routes + Controllers   //+//
//+//+//+//+//+//+//+//+//+//+//+//
// GET -> SignUp /users/signup
router.get('/signup', (req, res) => {
    const { username, signedIn, userId } = req.session

    res.render('users/signup', { username, signedIn, userId })
})

// POST -> SignUp /users/signup
router.post('/signup', async (req, res) => {
    // const { username, signedIn, userId } = req.session
    const newUser = req.body

    newUser.password = await bcrypt.hash(
        newUser.password, 
        await bcrypt.genSalt(10)
    )

    // create new user
    User.create(newUser)
        .then(user => {
            res.redirect('/users/signin')
        })
        .catch(err => {
            console.log('error')

            res.redirect(`/error?error=${err}`)
        })
    })

// GET -> SignIn /users/signin
router.get('/signin', (req, res) => {
    const { username, signedIn, userId } = req.session

    res.render('users/signin', { username, signedIn, userId })
})

// POST -> SignIn
router.post('/signin', async (req, res) => {

    const { username, password } = req.body
    // search db for user
    User.findOne({ username })
        .then(async (user) => {
            if (user) {
                const result = await bcrypt.compare(password, user.password)

                if (result) {
                    req.session.username = username
                    req.session.signedIn = true
                    req.session.userId = user.id

                    res.redirect('/')
                } else {
                    res.send('something went wrong - no pw match')
                }
            } else {
                res.send('something went wrong - no user with that name')
            }
        })
        .catch(error => {
            console.log('error')

            res.send('something went wrong')
        })
})

// GET -> SignOut /users/signout
router.get('/signout', (req, res) => {
    const { username, signedIn, userId } = req.session

    res.render('users/signout', { username, signedIn, userId })
})

// DELETE -> SignOut
router.delete('/signout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router