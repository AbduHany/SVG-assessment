const dbClient = require("../utils/db");
const Permission = dbClient.models.permission;

class PermissionController {
  static async getAll(req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          msg: "Unauthorized: Only Admins can view all permissions",
        });
      }
      const permissions = await Permission.findAll();
      return res.status(200).json(permissions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async createOrUpdate(req, res) {
    try {
      const { userId, resource, canView, canCreate, canUpdate, canDelete } =
        req.body;

      if (!req.user.isAdmin) {
        return res.status(403).json({
          msg: "Unauthorized: Only Admins can create/update permissions",
        });
      }

      if (!userId || !resource) {
        return res
          .status(400)
          .json({ message: "userId and resource are required" });
      }

      const [permission, created] = await Permission.findOrCreate({
        where: { userId, resource },
        defaults: {
          userId,
          resource,
          canView: canView ?? false,
          canCreate: canCreate ?? false,
          canUpdate: canUpdate ?? false,
          canDelete: canDelete ?? false,
        },
      });

      if (!created) {
        await permission.update({
          canView: canView ?? permission.canView,
          canCreate: canCreate ?? permission.canCreate,
          canUpdate: canUpdate ?? permission.canUpdate,
          canDelete: canDelete ?? permission.canDelete,
        });
      }

      return res.status(created ? 201 : 200).json(permission);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async removePermission(req, res) {
    try {
      const { userId, resource } = req.params;

      if (!req.user.isAdmin) {
        return res.status(403).json({
          msg: "Unauthorized: Only Admins can remove permissions",
        });
      }

      const permission = await Permission.findOne({
        where: { userId, resource },
      });

      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      await permission.destroy();
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = PermissionController;
