const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createFolder = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;  // Assuming user is authenticated

    try {
        const newFolder = await prisma.folder.create({
            data: {
                name,
                userId,
            },
        });
        res.status(201).json(newFolder);
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
    const folderId = req.params.id;
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

exports.deleteFolder = async (req, res) => {
    const folderId = req.params.id;

    try {
        await prisma.folder.delete({
            where: { id: folderId },
        });
        res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete folder' });
    }
};