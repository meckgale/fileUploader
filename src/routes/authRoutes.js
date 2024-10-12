const { Router } = require("express")
const authRoutes = Router();
const authController = require("../controllers/authController")

authRoutes.get("/signup", (req, res) =>
    res.render("signup", { title: "Sign Up" })
);

authRoutes.post("/signup", authController.signup);

authRoutes.get("/login", (req, res) => res.render("login"));
authRoutes.post("/login", authController.login);

authRoutes.get("/logout", authController.logout);

module.exports = authRoutes;

