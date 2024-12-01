const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const User = require("../models/User");

const userRouter = express.Router();

// Route: Get current user details
userRouter.get("/user/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("name email role");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = userRouter;
