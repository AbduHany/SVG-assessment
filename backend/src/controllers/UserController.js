const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const dbClient = require("../utils/db");

const User = dbClient.models.user;
const Role = dbClient.models.role;

class UserController {
  static async getAll(req, res) {
    try {
      const users = await User.findAll({
        order: [["name", "ASC"]],
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async create(req, res) {
    try {
      const { name, email, password, isAdmin, isActive } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const userId = uuidv4();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        id: userId,
        name,
        email,
        password: hashedPassword,
        isAdmin,
        isActive: isActive ?? true,
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, roleName, isActive } = req.body;

      if (!req.user.role.isAdmin) {
        return res.status(403).json({
          msg: "Unauthorized: Only Admins can update users",
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(409).json({ message: "Email already exists" });
        }
      }

      const roleRecord = await Role.findOne({ where: { name: roleName } });
      if (!roleRecord) {
        return res.status(400).json({ msg: "Invalid role" });
      }
      const roleId = roleRecord.id;

      if (roleId && roleId !== user.roleId) {
        const role = await Role.findByPk(roleId);
        if (!role) {
          return res.status(400).json({ message: "Invalid role" });
        }
      }

      const updatedValues = {
        name: name ?? user.name,
        email: email ?? user.email,
        roleId: roleId ?? user.roleId,
        isActive: isActive ?? user.isActive,
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updatedValues.password = await bcrypt.hash(password, salt);
      }

      await user.update(updatedValues);

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!req.user.role.isAdmin) {
        return res.status(403).json({
          msg: "Unauthorized: Only Admins can delete users",
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = UserController;
