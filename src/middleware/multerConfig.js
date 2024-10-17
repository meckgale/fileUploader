const multer = require("multer");

// Use memoryStorage instead of diskStorage
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
});

module.exports = upload;
