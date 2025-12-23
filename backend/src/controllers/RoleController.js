const dbClient = require("../utils/db");
const Role = dbClient.models.role;

class RoleController {
  static async create(req, res) {
    try {
      const { name, description, isAdmin } = req.body;

      // Prevent creation of duplicate role names
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return res.status(409).json({ message: "Role name already exists" });
      }

      const role = await Role.create({
        name,
        description,
        isAdmin: isAdmin || false,
      });

      return res.status(201).json(role);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getAll(req, res) {
    try {
      const roles = await Role.findAll();
      return res.status(200).json(roles);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = RoleController;
