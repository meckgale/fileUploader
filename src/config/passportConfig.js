const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");  // Import Prisma Client
const prisma = new PrismaClient();  // Instantiate Prisma Client

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            // Use Prisma to find the user by username
            const user = await prisma.user.findUnique({
                where: { username },
            });

            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        // Use Prisma to find the user by ID
        const user = await prisma.user.findUnique({
            where: { id },  // Fetching the user by ID from the database
        });
        done(null, user); // Passing the user to the next step
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
