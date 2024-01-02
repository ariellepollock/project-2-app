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

// POST -> SignUp

// GET -> SignIn /users/signin
router.get('/signin', (req, res) => {
    const { username, signedIn, userId } = req.session

    res.render('users/signin', { username, signedIn, userId })
})

// POST -> SignIn

// GET -> SignOut /users/signout
router.get('/signout', (req, res) => {
    const { username, signedIn, userId } = req.session

    res.render('users/signout', { username, signedIn, userId })
})

// DELETE -> SignOut

//+//+//+//+//+//+//+//+//+//+//+//
//+//  Export Router          //+//
//+//+//+//+//+//+//+//+//+//+//+//
module.exports = router