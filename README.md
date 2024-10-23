# Personal Drive - Stripped Down Google Drive

[Personal Drive](https://odd-tedra-meck-aae6a2a6.koyeb.app/)

This project is a simplified version of Google Drive, allowing users to upload, manage, and share files and folders. 
It was built using **Express**, **Prisma**, and **Cloudinary** (for cloud storage), with **session-based authentication** for securing access.

## Features
- **User Authentication**: Users can sign up and log in using session-based authentication handled by **Passport.js** and **Prisma session store**.
- **File and Folder Management**: Users can create folders, upload files into them, and view detailed file information (file name, size, upload time).
- **Shareable Links**: Users can generate time-limited, shareable links to folders for unauthenticated users.
- **Cloud Storage**: Files are uploaded and stored securely on **Cloudinary**, ensuring easy access and retrieval.

## Technologies Used
- **Backend Framework**: [Express](https://expressjs.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Passport.js](http://www.passportjs.org/)
- **Cloud Storage**: [Cloudinary](https://cloudinary.com/)
- **Session Management**: Prisma session store with **Express Sessions** for handling user sessions.
- **File Uploading**: [Multer](https://github.com/expressjs/multer) middleware for handling file uploads.
- **Frontend Rendering**: EJS templating engine for rendering dynamic views.
- **Styling**: [TailwindCSS](https://tailwindcss.com/) with [DaisyUI](https://daisyui.com/) for styling UI components.

## Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/meckgale/fileUploader.git
   cd fileUploader

2. Install dependencies:
   ```bash
   npm install

3. Create .env file for environment variables and add your database and cloud storage configuration:
   ```
   DATABASE_URL=your_prisma_database_url
   CLOUDINARY_URL=your_cloudinary_url
   BASE_URL=http://localhost:5000
   SESSION_SECRET=your_secret

4. Run the Prisma migrations to set up the database:
   ```bash
   npx prisma migrate deploy

5. Start the server:
   ```bash
   npm start
