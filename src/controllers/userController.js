const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../config/logger');

// Validation rules
const validateUser = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('dob')
    .isISO8601()
    .withMessage('Please provide a valid date in YYYY-MM-DD format')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      
      if (dob > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      // Check if user is at least 1 year old
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 1) {
        throw new Error('User must be at least 1 year old');
      }
      
      return true;
    })
];

// Create user endpoint
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in user creation:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, dob } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Duplicate email attempt: ${email}`);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      dob: new Date(dob)
    });

    await user.save();

    logger.info(`New user created: ${email}`, {
      userId: user._id,
      username: user.username,
      email: user.email
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        dob: user.dob,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    logger.error('Error creating user:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-__v');
    
    logger.info('Retrieved all users', { count: users.length });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Error retrieving users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get users with birthdays today
const getBirthdayUsers = async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const birthdayUsers = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dob' }, month] },
          { $eq: [{ $dayOfMonth: '$dob' }, day] }
        ]
      }
    });

    logger.info('Retrieved birthday users for today', { 
      count: birthdayUsers.length,
      date: today.toISOString().split('T')[0]
    });

    res.json({
      success: true,
      data: birthdayUsers,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    logger.error('Error retrieving birthday users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getBirthdayUsers,
  validateUser
};
