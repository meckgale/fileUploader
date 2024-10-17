const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs"); // For file system operations
const path = require("path");

const upload = require("../middleware/multerConfig");
const cloudinary = require("../config/cloudinary");

exports.getFile = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the file from the database
    const file = await prisma.file.findUnique({
      where: { id: id },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    // Render the file.ejs view and pass the file data
    res.render("file", { file });
  } catch (error) {
    console.error("Error getting file from the database:", error);
    res.status(500).json({ error: "Unable to get file" });
  }
};

exports.uploadFile = [
  upload.single("file"), // Use multer to handle file upload
  async (req, res) => {
    const folderId = req.params.folderId; // Folder ID from URL

    try {
      // Upload file to Cloudinary using file buffer
      const cloudinaryResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Pass the file buffer to Cloudinary's upload_stream
        stream.end(req.file.buffer);
      });

      // Extract the file extension from the original name
      const extension = path.extname(req.file.originalname);

      // Save file to the folder in DB
      await prisma.file.create({
        data: {
          name: req.file.originalname, // Use the original name or generated name
          path: cloudinaryResult.secure_url, // Path generated from Cloudinary
          originalName: req.file.originalname, // Store the original name
          folderId: folderId, // Associate file with folder
          extension: extension, // Store file extension
          size: req.file.size, // Save the file size in bytes
        },
      });

      // Log confirmation and redirect
      console.log("New file created");
      res.redirect(`/folders/${folderId}`);
    } catch (error) {
      console.error("Error saving file to database:", error);
      res.status(500).json({ error: "Failed to save file to database" });
    }
  },
];

exports.deleteFile = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the file from the database
    const file = await prisma.file.findUnique({
      where: { id: id },
    });

    if (!file) {
      req.flash("error", "File not found");
      return res.redirect("/folders");
    }

    // Extract the Cloudinary public_id from the file path
    const fileUrl = file.path;
    const publicId = fileUrl.split("/").pop().split(".")[0]; // Extract public_id

    // Delete the file from Cloudinary
    cloudinary.uploader.destroy(publicId, async (error, result) => {
      if (error) {
        console.error("Cloudinary deletion error:", error);
        req.flash("error", "Failed to delete file from Cloudinary");
        return res.redirect(`/folders/${folderId}`);
      }

      console.log("Cloudinary delete result:", result);

      // Delete the file from the database
      await prisma.file.delete({
        where: { id: id },
      });

      // Set success message and redirect after successful deletion
      req.flash("success", "File deleted successfully");
      res.redirect("/folders");
    });
  } catch (error) {
    console.error("Error deleting file from the database:", error);
    req.flash("error", "Unable to delete file");
    res.redirect(`/folders/${folderId}`);
  }
};

exports.downloadFile = async (req, res) => {
  const id = req.params.id; // Use `id` for file lookup

  try {
    // Find the file by its `id`
    const file = await prisma.file.findUnique({ where: { id: id } });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check if the Cloudinary URL exists in the file record
    if (!file.path) {
      return res
        .status(500)
        .json({ error: "File path is missing or incomplete" });
    }

    // Redirect to the Cloudinary URL for downloading
    res.redirect(file.path); // Redirect user to the Cloudinary URL for download
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Error downloading file" });
  }
};
