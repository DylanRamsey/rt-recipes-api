const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc Register new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password} = req.body
    if(!name || !email || !password) {
      res.status(400)
      //throw new Error('Please add all fields')
    }

    //check if user exist

    const userExists = await User.findOne({email})

    if(userExists) {
      res.status(400)
      //throw new Error('User already exist')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    if(user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        
      })
    } else {
      res.status(400)
      //throw new Error('Invail user data')
    }
  } catch (err) {
    console.error(err);
  }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body
    // Check for user email
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        
      })
    } else {
      res.status(400)
      //throw new Error('Invalid credentials')
    }
  }catch (err) {
    console.error(err);
  }
})

// @desc Get user data
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  try {
    const {_id, name, email} = await User.findById(req.user.id)
    res.status(200).json({
      id: _id,
      name,
      email
    })
  } catch (err) {
    console.error(err);
  }
})

module.exports = {
  registerUser,
  loginUser,
  getMe
}