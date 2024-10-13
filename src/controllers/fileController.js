const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const multer = require('multer');

const upload = require('../middleware/multerConfig');

exports.uploadFile = [
    upload.single('file'), // Middleware to handle file upload
    async (req, res) => {
      const folderId = req.params.folderId; // Folder ID from URL
  
      try {
        // Save file to the folder in DB
        const newFile = await prisma.file.create({
          data: {
            name: req.file.originalname,
            folderId: folderId, // Associate file with folder
          },
        });
  
        console.log("New file created:", newFile); // Log for confirmation
  
        // Redirect the user after successful upload
        res.redirect(`/folders/${folderId}`);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to upload file' });
      }
    },
  ];

exports.downloadFile = async (req, res) => {
    const { id } = req.params; // File ID from URL
    const file = await prisma.file.findUnique({ where: { id: id } });
    res.download(path.join(__dirname, '../uploads', file.path)); // Serve file for download
};