const orderRouter = require("express").Router();
const OrderController = require("../controllers/OrderController");
const authenticate = require("../middlewares/AuthMiddleware");
const checkPermissions = require("../middlewares/PermissionsMiddleware");

orderRouter.use(authenticate);

orderRouter.get(
  "/",
  checkPermissions("orders", "view"),
  OrderController.getAll
);
orderRouter.get(
  "/users/:userId",
  checkPermissions("orders", "view"),
  OrderController.getByUserId
);
orderRouter.get(
  "/clients/:clientId",
  checkPermissions("orders", "view"),
  OrderController.getByClientId
);
orderRouter.get(
  "/:id",
  checkPermissions("orders", "view"),
  OrderController.getById
);
orderRouter.post(
  "/",
  checkPermissions("orders", "create"),
  OrderController.create
);
orderRouter.put(
  "/:id",
  checkPermissions("orders", "update"),
  OrderController.update
);
orderRouter.delete(
  "/:id",
  checkPermissions("orders", "delete"),
  OrderController.delete
);

module.exports = orderRouter;
