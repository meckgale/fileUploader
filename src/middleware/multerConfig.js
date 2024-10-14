const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage options for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderId = req.params.folderId;  // Assuming folderId is passed in the URL
        const folderPath = path.join(__dirname, '../../uploads', folderId);

        // Check if folder exists, if not, create it
        fs.mkdirSync(folderPath, { recursive: true });
        cb(null, folderPath);  // Save files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Save file with original name and a timestamp to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Configure multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // Limit file size to 10 MB
});

module.exports = upload;
