const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

exports.createFolder = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // Assuming user is authenticated

  try {
    await prisma.folder.create({
      data: {
        name,
        userId,
      },
    });
    res.redirect("/folders");
  } catch (error) {
    res.status(500).json({ error: "Unable to create folder" });
  }
};

exports.getFolderUpdate = async (req, res) => {
  const folderId = req.params.folderId;

  try {
    // Fetch the folder from the database to pre-fill the form
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Render the updateFolder.ejs file with the folder data
    res.render("updateFolder", { folder });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch folder" });
  }
};

exports.getFolders = async (req, res) => {
  const userId = req.user.id;

  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId,
      },
      include: {
        files: true, // Include files in each folder if needed
      },
    });
    // Render the folder.ejs view and pass the folders data
    res.render("folder", { folders });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch folders" });
  }
};

exports.updateFolder = async (req, res) => {
  const folderId = req.params.folderId;
  const { name } = req.body;

  try {
    await prisma.folder.update({
      where: { id: folderId },
      data: { name },
    });
    res.redirect("/folders");
  } catch (error) {
    res.status(500).json({ error: "Unable to update folder" });
  }
};

exports.getFolderContents = async (req, res) => {
  const folderId = req.params.folderId;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { files: true }, // Include the files in the folder
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Render the folder view with the contents of the specific folder
    res.render("folderContent", { folder });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch folder contents" });
  }
};

exports.deleteFolder = async (req, res) => {
  const folderId = req.params.folderId;

  try {
    // Fetch all files in the folder
    const files = await prisma.file.findMany({
      where: { folderId: folderId },
    });

    if (files.length > 0) {
      // Loop through the files and delete them from both the file system and the database
      for (const file of files) {
        // Construct the file path
        const filePath = path.join(
          __dirname,
          "../../uploads",
          file.folderId,
          file.name
        );

        // Check if the file exists
        if (fs.existsSync(filePath)) {
          try {
            // Delete the file from the server
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error("Error deleting file from the server:", err);
          }
        } else {
          console.log("File not found on the server:", filePath);
        }

        // Delete the file from the database
        await prisma.file.deleteMany({
          where: { id: file.id },
        });
      }
    }

    // Delete the folder from the database using the folder's id
    await prisma.folder.delete({
      where: { id: folderId },
    });

    // Remove the folder from the file system
    const folderPath = path.join(__dirname, "../../uploads", folderId);
    console.log("Attempting to delete folder at path:", folderPath);

    // Check if folder exists before trying to delete it
    if (fs.existsSync(folderPath)) {
      console.log("Attempting to delete folder at path:", folderPath);
      try {
        fs.rmSync(folderPath, { recursive: true });
        console.log("Folder deleted from the file system:", folderPath);
      } catch (err) {
        console.error("Error deleting folder from the file system:", err);
        return res
          .status(500)
          .json({ error: "Unable to delete folder from the file system" });
      }
    } else {
      console.log("Folder not found on the server:", folderPath);
    }

    // Redirect to /folders after successful deletion
    return res.redirect("/folders");
  } catch (error) {
    console.error("Error deleting folder:", error); // Log the error for debugging
    return res.status(500).json({ error: "Unable to delete folder" });
  }
};
