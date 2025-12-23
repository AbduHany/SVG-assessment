var DataTypes = require("sequelize").DataTypes;
var user = require("./User");
var client = require("./Client");
var role = require("./Role");
var permission = require("./Permission");
var product = require("./Product");
var order = require("./Order");
var orderItem = require("./OrderItem");
var payment = require("./Payment");

function initModels(sequelize) {
  var user = require("./User")(sequelize, DataTypes);
  var client = require("./Client")(sequelize, DataTypes);
  var role = require("./Role")(sequelize, DataTypes);
  var permission = require("./Permission")(sequelize, DataTypes);
  var product = require("./Product")(sequelize, DataTypes);
  var order = require("./Order")(sequelize, DataTypes);
  var orderItem = require("./OrderItem")(sequelize, DataTypes);
  var payment = require("./Payment")(sequelize, DataTypes);

  user.belongsTo(role, { foreignKey: "roleId", as: "role" });
  user.hasMany(permission, {
    foreignKey: "userId",
    as: "permissions",
  });
  user.hasMany(order, { foreignKey: "userId", as: "orders" });

  role.hasMany(user, { foreignKey: "roleId", as: "users" });

  permission.belongsTo(user, {
    foreignKey: "userId",
    as: "user",
  });

  client.hasMany(order, { foreignKey: "clientId", as: "orders" });

  product.hasMany(orderItem, {
    foreignKey: "productId",
    as: "orderItems",
  });

  order.belongsTo(client, {
    foreignKey: "clientId",
    as: "client",
  });
  order.belongsTo(user, {
    foreignKey: "userId",
    as: "createdBy",
  });
  order.hasMany(orderItem, {
    foreignKey: "orderId",
    as: "items",
  });
  order.hasMany(payment, {
    foreignKey: "orderId",
    as: "payments",
  });

  orderItem.belongsTo(order, {
    foreignKey: "orderId",
    as: "order",
  });
  orderItem.belongsTo(product, {
    foreignKey: "productId",
    as: "product",
  });

  payment.belongsTo(order, {
    foreignKey: "orderId",
    as: "order",
  });

  return {
    user,
    client,
    role,
    permission,
    product,
    order,
    orderItem,
    payment,
  };
}

module.exports = initModels;
