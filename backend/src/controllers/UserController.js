const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const dbClient = require("../utils/db");

const User = dbClient.models.user;
const Permission = dbClient.models.permission;

class UserController {
  static async getProfile(req, res) {
    try {
      res.json(req.user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getAll(req, res) {
    try {
      const users = await User.findAll({
        order: [["name", "ASC"]],
      });
      return res.status(200).json(users);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async create(req, res) {
    try {
      const { name, password, email, isAdmin } = req.body;

      // Check if the user exists
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      const userId = uuidv4();

      // Create a new user instance
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = await User.create({
        id: userId,
        name,
        email,
        password: hashedPassword,
        isAdmin: isAdmin ?? false,
        isActive: true,
      });
      res.status(201).json({ msg: "User Created Successfuly" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, isAdmin, isActive } = req.body;

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

      const updatedValues = {
        name: name ?? user.name,
        email: email ?? user.email,
        isAdmin: isAdmin ?? user.isAdmin,
        isActive: isActive ?? user.isActive,
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updatedValues.password = await bcrypt.hash(password, salt);
      }

      await user.update(updatedValues);

      return res.status(200).json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.destroy();
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = UserController;
