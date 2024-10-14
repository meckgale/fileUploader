const { Router } = require("express");
const fileRoutes = Router();
const fileController = require('../controllers/fileController');
const isAuthenticated = require('../middleware/isAuthenticated');

fileRoutes.post('/:folderId/upload', isAuthenticated, fileController.uploadFile);
fileRoutes.get('/:id/download', isAuthenticated, fileController.downloadFile);
fileRoutes.post('/:id/delete',isAuthenticated, fileController.deleteFile);

module.exports = fileRoutes;