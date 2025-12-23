const productRouter = require("express").Router();
const ProductController = require("../controllers/ClientController");
const authenticate = require("../middlewares/AuthMiddleware");
const checkPermissions = require("../middlewares/PermissionsMiddleware");

productRouter.use(authenticate);

productRouter.get(
  "/",
  checkPermissions("products", "view"),
  ProductController.getAll
);
productRouter.get(
  "/:id",
  checkPermissions("products", "view"),
  ProductController.getById
);
productRouter.post(
  "/",
  checkPermissions("products", "create"),
  ProductController.create
);
productRouter.put(
  "/:id",
  checkPermissions("products", "update"),
  ProductController.update
);
productRouter.delete(
  "/:id",
  checkPermissions("products", "delete"),
  ProductController.delete
);

module.exports = productRouter;
