const http = require('http');
const app = require('./src/app');  // Importing the configured app
const PORT = process.env.PORT || 5000;

http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
