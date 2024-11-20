const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/dotenv');

const authRouter = express.Router();

// Route for User Registration
authRouter.post(
    '/register',
    [
        body('email').isEmail().withMessage('Invalid email format.'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters.'),
        body('nickname').notEmpty().withMessage('Nickname is required.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, nickname } = req.body;

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create and save new user
            const newUser = new User({
                email,
                passwordHash: hashedPassword,
                nickname,
            });
            await newUser.save();

            res.status(201).json({ message: 'User registered successfully.' });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
);

// Route for User Login
authRouter.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email format.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ token });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
);

module.exports = authRouter;