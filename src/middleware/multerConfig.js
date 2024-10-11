const multer = require('multer');
const path = require('path');

// Define storage options for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Save files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Save file with original name and a timestamp to avoid conflicts
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Configure multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // Limit file size to 10 MB
});

module.exports = upload;
