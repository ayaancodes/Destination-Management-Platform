//This file handles Express setup, middleware, and routes

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const destinationsRouter = require('./routes/destinationsRoutes');
const listsrouter = require('./routes/listsRoutes');
const { authenticateToken, authorizeAdmin } = require('./middleware/authMiddleware');
const authRoutes =  require('./routes/authRoutes');
const listsRouter = require('./routes/listsRoutes');
const adminRouter = require('./routes/adminRoutes');



const app = express();

//Enable Cors
app.use(cors());



// Middleware to parse JSON and limit request size
app.use(express.json({ limit: '10kb' }));

// Rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use(limiter);

// Static file serving for client
app.use(express.static(path.join(__dirname, '../client')));

//Mounting Routes
app.use('/api/destinations', destinationsRouter);
app.use('/api/lists', listsRouter);
app.use('/api', authRoutes);
app.use('/api/admin', authenticateToken, adminRouter);


module.exports = app;