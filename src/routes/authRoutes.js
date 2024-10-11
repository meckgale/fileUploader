const { Router } = require("express")
const authRoutes = Router();

authRoutes.get("/", (req, res) => {
    console.log("auth");
    res.send({ message: "Hey" })
})

module.exports = authRoutes