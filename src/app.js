require("dotenv").config();
const express = require('express');
const app = express();
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

const prisma = new PrismaClient();  // Instantiate PrismaClient once

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up passport for authentication
app.use(session({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // ms, one week
    },
    secret: process.env.SESSION_SECRET,  // Your secret for sessions
    resave: false, // Do not save session if nothing is changed
    saveUninitialized: false, // Do not create empty sessions for unauthenticated users
    store: new PrismaSessionStore(
        prisma,  // Reuse the single Prisma instance
        {
            checkPeriod: 2 * 60 * 1000,  // Check expired sessions every 2 minutes
            dbRecordIdIsSessionId: true,  // Use session ID as primary key in the DB
            dbRecordIdFunction: undefined,  // Optional: Define custom function to generate session ID
        }
    )
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware to serve static files like HTML
app.use(express.static(path.join(__dirname, 'views')));

// Routes
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);

// Example route to serve the file upload form
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'uploadForm.ejs'));
});


module.exports = app; // Export the configured app
