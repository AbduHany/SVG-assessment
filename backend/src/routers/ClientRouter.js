const clientRouter = require("express").Router();
const ClientController = require("../controllers/ClientController");
const authenticate = require("../middlewares/AuthMiddleware");
const checkPermissions = require("../middlewares/PermissionsMiddleware");

// authenticate on all routes
clientRouter.use(authenticate);

clientRouter.get(
  "/",
  checkPermissions("clients", "view"),
  ClientController.getAll
);
clientRouter.get(
  "/:id",
  checkPermissions("clients", "view"),
  ClientController.getById
);
clientRouter.post(
  "/",
  checkPermissions("clients", "create"),
  ClientController.create
);
clientRouter.put(
  "/:id",
  checkPermissions("clients", "update"),
  ClientController.update
);
clientRouter.delete(
  "/:id",
  checkPermissions("clients", "delete"),
  ClientController.delete
);

module.exports = clientRouter;
