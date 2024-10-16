const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs"); // For file system operations
const path = require("path");

const upload = require("../middleware/multerConfig");

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
  upload.single("file"), // Middleware to handle file upload
  async (req, res) => {
    const folderId = req.params.folderId; // Folder ID from URL

    try {
      // Extract the file extension from the original name
      const extension = path.extname(req.file.originalname);
      // Save file to the folder in DB
      const newFile = await prisma.file.create({
        data: {
          name: req.file.generatedName, // Store the generated name
          originalName: req.file.originalname, // Store the original name
          folderId: folderId, // Associate file with folder
          extension: extension,
          size: req.file.size, // Save the file size in bytes
          createdAt: req.file.createdAt,
        },
      });

      console.log("New file created:", newFile); // Log for confirmation
      console.log(upload);

      // Redirect the user after successful upload
      res.redirect(`/folders/${folderId}`);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to upload file" });
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
      return res.status(404).json({ error: "File not found" });
    }

    // Build the correct path to the file on your system
    const filePath = path.join(
      __dirname,
      "../../uploads",
      file.folderId,
      file.name
    );
    console.log("File ID:", file.id);

    console.log("Deleting file at path:", filePath);

    // Check if file exists before trying to delete it
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on the server" });
    }

    // Delete the file from the file system
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file from the server:", err);
        console.error("File Path:", filePath);
        return res
          .status(500)
          .json({ error: "Error deleting file from the server" });
      }

      // Delete the file from the database
      await prisma.file.delete({
        where: { id: id },
      });

      res.status(200).json({ message: "File deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting file from the database:", error);
    res.status(500).json({ error: "Unable to delete file" });
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

    // Check if folderId and file.name exist
    if (!file.folderId || !file.id) {
      return res
        .status(500)
        .json({ error: "File path is missing or incomplete" });
    }

    // Construct the file path
    const filePath = path.join(
      __dirname,
      "../../uploads",
      file.folderId,
      file.name
    );
    console.log(filePath);

    // Check if the file exists before attempting to download it
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on the server" });
    }

    // If file exists, send it for download
    res.download(filePath);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Error downloading file" });
  }
};
