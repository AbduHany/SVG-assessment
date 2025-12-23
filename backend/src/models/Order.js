const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "client_id",
        comment: "Client order being creater for",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
        comment: "User who created the order",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: "total_amount",
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "completed", "cancelled"),
        defaultValue: "pending",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "order_date",
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      underscored: true,
    }
  );

  return Order;
};
