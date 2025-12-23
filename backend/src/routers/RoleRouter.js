const roleRouter = require("express").Router();
const RoleController = require("../controllers/RoleController");

roleRouter.post("/", RoleController.create);
roleRouter.get("/", RoleController.getAll);

module.exports = roleRouter;
