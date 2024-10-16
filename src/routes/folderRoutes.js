const { Router } = require("express");
const folderRoutes = Router();
const folderController = require("../controllers/folderController");
const fileController = require("../controllers/fileController");
const isAuthenticated = require("../middleware/isAuthenticated");

folderRoutes.post("/create", isAuthenticated, folderController.createFolder);

folderRoutes.get("/", isAuthenticated, folderController.getFolders);

folderRoutes.get(
  "/:folderId",
  isAuthenticated,
  folderController.getFolderContents
);

folderRoutes.get(
  "/:folderId/update",
  isAuthenticated,
  folderController.getFolderUpdate
);

folderRoutes.post(
  "/:folderId/update",
  isAuthenticated,
  folderController.updateFolder
);

folderRoutes.post(
  "/:folderId/delete",
  isAuthenticated,
  folderController.deleteFolder
);

folderRoutes.post(
  "/:folderId/upload",
  isAuthenticated,
  fileController.uploadFile
);

module.exports = folderRoutes;
