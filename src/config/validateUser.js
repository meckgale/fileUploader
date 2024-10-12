const { body } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();  // Instantiate Prisma Client

const alphaErr = "must only contain letters.";
const matchesErr =
    "must only contain letters or numbers. underscores, periods, or hyphens cannot be use consecutive, start or end of the username.";
const lengthErr = "must be between 2 and 30 characters.";

const validateUser = [
    body("username")
        .custom(async (username) => {
            const user = await prisma.user.findUnique({
                where: { username: username },
            });
            if (user) {
                throw new Error("This username is taken, try a different user name");
            }
            return true;
        })
        .trim()
        .matches(/^(?!.*[._-]{2,})(?![._-])[a-zA-Z0-9._-]+(?<![._-])$/)
        .withMessage(`Username ${matchesErr}`)
        .isLength({ min: 2, max: 30 })
        .withMessage(`Username ${lengthErr}`),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long.")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter.")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter.")
        .matches(/\d/)
        .withMessage("Password must contain at least one number.")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character."),
    body("passwordConfirmation").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
];

module.exports = { validateUser }