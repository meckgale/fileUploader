const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createFolder = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;  // Assuming user is authenticated

    try {
        await prisma.folder.create({
            data: {
                name,
                userId,
            },
        });
        res.redirect('/folders');
    } catch (error) {
        res.status(500).json({ error: 'Unable to create folder' });
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
                files: true,  // Include files in each folder if needed
            },
        });
        // Render the folder.ejs view and pass the folders data
        res.render('folder', { folders });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch folders' });
    }
};

exports.updateFolder = async (req, res) => {
    const folderId = req.params.folderId;
    const { name } = req.body;

    try {
        const updatedFolder = await prisma.folder.update({
            where: { id: folderId },
            data: { name },
        });
        res.status(200).json(updatedFolder);
    } catch (error) {
        res.status(500).json({ error: 'Unable to update folder' });
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
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Render the folder view with the contents of the specific folder
        res.render('folderContent', { folder });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch folder contents' });
    }
};


exports.deleteFolder = async (req, res) => {
    const folderId = req.params.folderId;

    try {
        // Fetch all files in the folder
        const files = await prisma.file.findMany({
            where: { folderId: folderId }
        });

        if (files.length > 0) {
            // Loop through the files and delete them from both the file system and the database
            for (const file of files) {

                console.log("Deleting file:", file.name);
                console.log("Folder ID:", file.folderId);

                // Construct the file path
                const filePath = path.join(__dirname, '../../uploads', file.folderId, file.name);
                
                // Log the file path for debugging
                console.log("Deleting file at path:", filePath);

                // Check if the file exists
                if (fs.existsSync(filePath)) {
                    // Delete the file from the server
                    fs.unlinkSync(filePath);
                } else {
                    console.log("File not found on the server:", filePath);
                }

                // Delete the file from the database
                await prisma.file.delete({
                    where: { id: file.id }
                });
            }
        }

        // Delete the folder from the database
        await prisma.folder.delete({
            where: { id: folderId }
        });

        // Optionally, remove the folder from the file system
        const folderPath = path.join(__dirname, '../../uploads', folderId);
        fs.rmdirSync(folderPath, { recursive: true });

        console.log('Folder deleted:', folderId);
        res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete folder' });
    }
};
