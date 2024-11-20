const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/dotenv');

//Middleware to verify JWT
const authenticateToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];

    //Extract token from header
    const token = authHeader && authHeader.split('')[1];
    if(!token){
        return res.status(401).json({
            error: 'Access denied. No token provided.'
        });
    }

    try{
        //Verify Token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; //Attach decoded payload to request object
        next();
    }catch(error){
        res.status(403).json({
            error: 'Invalid token.'
        });
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

