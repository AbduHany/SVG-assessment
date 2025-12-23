const commentRouter = require("express").Router();
const CommentController = require("../controllers/CommentController");
const authenticate = require("../middlewares/AuthMiddleware");
const checkPermissions = require("../middlewares/PermissionsMiddleware");

commentRouter.use(authenticate);

commentRouter.get(
  "/",
  checkPermissions("comments", "view"),
  CommentController.getAll
);
commentRouter.get(
  "/:id",
  checkPermissions("comments", "view"),
  CommentController.getById
);
commentRouter.post(
  "/",
  checkPermissions("comments", "create"),
  CommentController.create
);
commentRouter.put(
  "/:id",
  checkPermissions("comments", "update"),
  CommentController.update
);
commentRouter.delete(
  "/:id",
  checkPermissions("comments", "delete"),
  CommentController.delete
);

module.exports = commentRouter;
