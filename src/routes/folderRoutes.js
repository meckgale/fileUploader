const { Router } = require("express")
const folderRoutes = Router();
const folderController = require("../controllers/folderController");
const isAuthenticated = require("../middleware/isAuthenticated");

folderRoutes.post('/create', isAuthenticated, folderController.createFolder);

folderRoutes.get('/', isAuthenticated, folderController.getFolders);

folderRoutes.put('/:id', isAuthenticated, folderController.updateFolder);

folderRoutes.delete('/:id', isAuthenticated, folderController.deleteFolder);

module.exports = folderRoutes;