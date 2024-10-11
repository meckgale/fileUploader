const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // File information is in req.file
    res.status(200).send(`File uploaded successfully: ${req.file.filename}`);
};

module.exports = {
    uploadFile
};
