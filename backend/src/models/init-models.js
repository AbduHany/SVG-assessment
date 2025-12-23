var DataTypes = require("sequelize").DataTypes;

function initModels(sequelize) {
  var user = require("./User")(sequelize, DataTypes);
  var client = require("./Client")(sequelize, DataTypes);
  var permission = require("./Permission")(sequelize, DataTypes);
  var product = require("./Product")(sequelize, DataTypes);
  var order = require("./Order")(sequelize, DataTypes);
  var orderItem = require("./OrderItem")(sequelize, DataTypes);
  var payment = require("./Payment")(sequelize, DataTypes);
  var comment = require("./Comment")(sequelize, DataTypes);

  user.hasMany(permission, {
    foreignKey: "userId",
    as: "permissions",
  });
  user.hasMany(order, { foreignKey: "userId", as: "orders" });

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
  order.hasMany(comment, {
    foreignKey: "orderId",
    as: "comments",
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

  comment.belongsTo(order, {
    foreignKey: "orderId",
    as: "order",
  });
  comment.belongsTo(user, {
    foreignKey: "userId",
    as: "user",
  });

  return {
    user,
    client,
    permission,
    product,
    order,
    orderItem,
    payment,
    comment,
  };
}

module.exports = initModels;
