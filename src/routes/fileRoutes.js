const { Router } = require("express");
const fileRoutes = Router();
const { uploadFile } = require('../controllers/fileController');
const upload = require('../middleware/multerConfig');

// Route for file upload
fileRoutes.post('/upload', upload.single('file'), uploadFile);  // 'file' is the field name in the form

module.exports = fileRoutes;