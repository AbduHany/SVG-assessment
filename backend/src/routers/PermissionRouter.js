const permissionRouter = require("express").Router();
const permissionController = require("../controllers/PermissionController");
const authenticate = require("../middlewares/AuthMiddleware");

permissionRouter.use(authenticate);

permissionRouter.get("/", permissionController.getAll);
permissionRouter.get("/users/:userId", permissionController.getByUserId);
permissionRouter.post("/add", permissionController.createOrUpdate);
permissionRouter.delete(
  "/remove/:userId/:resource",
  permissionController.removePermission
);

module.exports = permissionRouter;
