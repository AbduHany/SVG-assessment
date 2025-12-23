const userRouter = require("express").Router();
const UserController = require("../controllers/UserController");
const authenticate = require("../middlewares/AuthMiddleware");
const checkPermission = require("../middlewares/PermissionsMiddleware");

userRouter.use(authenticate);
userRouter.get("/", checkPermission("users", "view"), UserController.getAll);
userRouter.get(
  "/:id",
  checkPermission("users", "view"),
  UserController.getById
);
userRouter.post("/", checkPermission("users", "create"), UserController.create);
userRouter.put(
  "/:id",
  checkPermission("users", "update"),
  UserController.update
);
userRouter.delete(
  "/:id",
  checkPermission("users", "delete"),
  UserController.delete
);

module.exports = userRouter;
