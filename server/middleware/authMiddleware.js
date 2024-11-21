const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/dotenv');

//Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    try {
        console.log('Token:', token);
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({ error: 'Invalid token.' });
    }
};

//Middleware to check for admin access
const authorizeAdmin = (req, res, next) =>{
    if(req.user.role !=='admin'){
        return res.status(403).json({
            error: 'Access restricted to admin users. '
        })
    }
    next();
};

module.exports = {authenticateToken, authorizeAdmin};

