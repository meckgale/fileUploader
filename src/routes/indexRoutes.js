const { Router } = require("express");
const indexRoutes = Router();
const authRoutes = require('./authRoutes');
const fileRoutes = require('./fileRoutes');
const folderRoutes = require("./folderRoutes");

indexRoutes.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

indexRoutes.use('/auth', authRoutes);
indexRoutes.use('/files', fileRoutes);
indexRoutes.use('/folders', folderRoutes)

module.exports = indexRoutes;