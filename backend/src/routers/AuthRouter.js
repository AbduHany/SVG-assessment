const authRouter = require("express").Router();
const AuthController = require("../controllers/AuthController");
const authenticate = require("../middlewares/AuthMiddleware");

authRouter.post("/login", AuthController.postLogin);
authRouter.post("/register", AuthController.postRegister);
authRouter.post("/isLoggedIn", authenticate, AuthController.isLoggedIn);

module.exports = authRouter;
