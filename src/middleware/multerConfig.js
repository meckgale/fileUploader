const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderId = req.params.folderId; // Assuming folderId is passed in the URL
    const folderPath = path.join(__dirname, "../../uploads", folderId);
    console.log("file1:", file);

    // Check if folder exists, if not, create it
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath); // Save files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Save file with original name and a timestamp to avoid conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileNameWithSuffix = uniqueSuffix + "-" + file.originalname;
    cb(null, fileNameWithSuffix);
    file.generatedName = fileNameWithSuffix; // Save it temporarily to use in the controller
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
});

module.exports = upload;
