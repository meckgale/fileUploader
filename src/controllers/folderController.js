const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../config/cloudinary");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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
        // Extract the Cloudinary public ID from the file path (URL)
        const publicId = file.path.split("/").pop().split(".")[0]; // Adjust if necessary for how Cloudinary URLs are structured

        try {
          // Delete the file from Cloudinary
          await cloudinary.uploader.destroy(publicId);
          console.log(`File deleted from Cloudinary: ${file.originalName}`);
        } catch (error) {
          console.error(
            `Error deleting file from Cloudinary: ${file.originalName}`,
            error
          );
        }

        // Delete the files from the database
        await prisma.file.delete({
          where: { id: file.id },
        });
      }
    }

    // Delete the folder from the database using the folder's id
    await prisma.folder.delete({
      where: { id: folderId },
    });

    // Redirect to /folders after successful deletion
    return res.redirect("/folders");
  } catch (error) {
    console.error("Error deleting folder:", error); // Log the error for debugging
    return res.status(500).json({ error: "Unable to delete folder" });
  }
};

exports.shareFolder = async (req, res) => {
  const folderId = req.params.folderId;
  const { duration } = req.body; // Get duration from form input

  try {
    // Generate a unique share token
    const shareToken = uuidv4();

    // Calculate expiration date based on the given duration
    let expiresAt;
    if (duration) {
      expiresAt = new Date();
      if (duration.endsWith("d")) {
        expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
      }
      // You can extend this logic to support hours/minutes if needed.
    }
    // Update the folder with the generated shareToken and expiration date
    await prisma.folder.update({
      where: { id: folderId },
      data: { shareToken, expiresAt },
    });

    // Use BASE_URL from environment variables
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const shareableLink = `${baseUrl}/share/${shareToken}`;

    req.flash("success", `${shareableLink}`);
    res.redirect(`/folders/${folderId}`);
  } catch (error) {
    console.error("Error sharing folder:", error);
    res.status(500).json({ error: "Failed to share folder" });
  }
};

exports.viewSharedFolder = async (req, res) => {
  const { shareToken } = req.params;

  try {
    // Find the folder associated with the shareToken
    const folder = await prisma.folder.findFirst({
      where: {
        shareToken: shareToken,
        expiresAt: {
          gte: new Date(), // Ensure the share link is not expired
        },
      },
      include: { files: true },
    });

    if (!folder) {
      return res
        .status(404)
        .json({ error: "Shared folder not found or link expired" });
    }

    // Render a view to display the folder's contents
    res.render("sharedFolder", { folder });
  } catch (error) {
    console.error("Error accessing shared folder:", error);
    res.status(500).json({ error: "Unable to access shared folder" });
  }
};
