const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/dotenv');
const crypto = require('crypto') //To generate unique verification tokens

const authRouter = express.Router();

// Middleware to validate requests
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Route for User Registration
authRouter.post(
    '/open/register',
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

            //Generate a verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');



            // Create and save new user
            const newUser = new User({
                email,
                passwordHash: hashedPassword,
                nickname,
                verificationToken //Save token in the database
            });
            await newUser.save();

            //Mock email link
            const verificationLink = `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`;


            res.status(201).json({
                message: 'User registered successfully. Please verify your email.',
                verificationLink,
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
);

// Route for User Login
authRouter.post(
    '/open/login',
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

            // Check if user is active
            if (user.status !== 'active') {
                return res.status(403).json({
                    error: 'Your account is deactivated. Please contact the administrator.',
                });
            }

            // Check if email is verified
            if (!user.isVerified) {
                // Generate a new verification link
                const verificationToken = crypto.randomBytes(32).toString('hex');
                user.verificationToken = verificationToken;
                await user.save();

                const verificationLink = `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`;
                return res.status(403).json({
                    error: 'Please verify your email!',
                    verificationLink,
                });
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


// Route: Change Password
authRouter.put(
    '/auth/change-password',
    authenticateToken, // Ensure the user is authenticated
    [
        body('oldPassword').notEmpty().withMessage('Old password is required.'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long.')
            .matches(/\d/)
            .withMessage('New password must contain a number.')
            .matches(/[a-zA-Z]/)
            .withMessage('New password must contain a letter.'),
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = req.user.userId; // Extract userId from the authenticated token

            // Find the user in the database
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Verify the old password
            const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Old password is incorrect.' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the password in the database
            user.passwordHash = hashedPassword;
            await user.save();

            res.json({ message: 'Password updated successfully.' });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
);

//Email Verification Endpoint
authRouter.get('/verify-email/:token', async (req, res) => {

    try {
        const { token } = req.params;

        //Find user by token
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        //Mark the email as verified
        user.isVerified = true;
        user.verificationToken = null; //Clear the token after verificiation
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });

    }
});


// Route: Get current user details
authRouter.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('email nickname role status');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = authRouter;