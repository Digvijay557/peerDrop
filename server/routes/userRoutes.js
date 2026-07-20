const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/userModel");
const { Contact } = require("../models/contactModel");
const Auth = require("../middleware/Auth");

const router = express.Router();


// ===============================
// Register
// ===============================

router.post("/register", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            username,
            password: hashedPassword
        });

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Login
// ===============================

router.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Current Logged In User
// ===============================

router.get("/me", Auth, (req, res) => {

    return res.status(200).json({
        id: req.user.id,
        username: req.user.username
    });

});


// ===============================
// Search Users (by username)
// ===============================

router.get("/search", Auth, async (req, res) => {

    try {

        const q = (req.query.q || "").trim();

        if (!q) {
            return res.status(200).json({ users: [] });
        }

        const users = await User.find({
            username: { $regex: q, $options: "i" },
            _id: { $ne: req.user.id }
        })
            .select("username")
            .limit(10);

        return res.status(200).json({
            users: users.map((u) => ({
                id: u._id,
                username: u.username
            }))
        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Get Saved Contacts (permanent, accepted connections)
// ===============================

router.get("/contacts", Auth, async (req, res) => {

    try {

        const contacts = await Contact.find({ owner: req.user.id })
            .populate("contact", "username")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            contacts: contacts
                .filter((c) => c.contact)
                .map((c) => ({
                    id: c.contact._id,
                    username: c.contact.username
                }))
        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Logout
// ===============================

router.post("/logout", (req, res) => {

    return res.status(200).json({
        message: "Logged out successfully"
    });

});

module.exports = router;