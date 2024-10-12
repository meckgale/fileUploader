require("dotenv").config();
const { PrismaClient } = require("@prisma/client");  // Import Prisma Client
const prisma = new PrismaClient();  // Instantiate Prisma Client
const { validationResult } = require("express-validator");
const { validateUser } = require("../config/validateUser");
const bcrypt = require("bcryptjs");
const passport = require("../config/passportConfig");

exports.signup = [
    validateUser,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("signup", {
                title: "Sign Up",
                errors: errors.array(),
            });
        }
        const { username, password } = req.body;
        try {
            // Hash the password before storing it
            bcrypt.hash(password, 10, async (err, hashedPassword) => {
                if (err) {
                    return next(err); // Handle the error
                }
                // Store hashed password in the database
                await prisma.user.create({ data: { username: username, password: hashedPassword } });

                // Retrieve the user after insertion
                const newUser = await prisma.user.findUnique({
                    where: { username: username },
                });

                // Automatically log in the user after signup
                req.logIn(newUser, (err) => {
                    if (err) {
                        return next(err); // Handle error in logging in
                    }
                    return res.redirect("/"); // Redirect to home after login
                });
            });
        } catch (err) {
            return next(err);
        }
    },
];

exports.login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.log("Error:", err);
            return next(err);
        }
        if (!user) {
            console.log("Login failed:", info.message);
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log("Login error:", err);
                return next(err);
            }
            console.log("Login successful!");
            return res.redirect("/");
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};