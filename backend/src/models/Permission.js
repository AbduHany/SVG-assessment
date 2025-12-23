const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      resource: {
        type: DataTypes.ENUM(
          "products",
          "orders",
          "clients",
          "comments",
          "users"
        ),
        allowNull: false,
      },
      canView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "can_view",
      },
      canCreate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "can_create",
      },
      canUpdate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "can_update",
      },
      canDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "can_delete",
      },
    },
    {
      tableName: "permissions",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "resource"],
        },
      ],
    }
  );

  return Permission;
};
