module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "order_id",
      },
      paymentMethod: {
        type: DataTypes.ENUM("cash", "card"),
        allowNull: false,
        field: "payment_method",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "transaction_id",
      },
      paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "payment_date",
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "completed",
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      underscored: true,
    }
  );

  return Payment;
};
