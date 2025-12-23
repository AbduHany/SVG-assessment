const userRouter = require("express").Router();
const UserController = require("../controllers/UserController");
const authenticate = require("../middlewares/AuthMiddleware");

userRouter.use(authenticate);
userRouter.get("/", UserController.getAll);
userRouter.get("/:id", UserController.getById);
userRouter.put("/:id", UserController.update);
userRouter.delete("/:id", UserController.delete);

module.exports = userRouter;
