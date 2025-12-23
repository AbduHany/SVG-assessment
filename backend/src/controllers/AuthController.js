const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const dbClient = require("../utils/db");
const jwt = require("jsonwebtoken");
const getenv = require("getenv");
const User = dbClient.models.user;
const Role = dbClient.models.role;

class AuthController {
  static async postLogin(req, res) {
    const { email, password } = req.body;

    try {
      // Check if the user exists
      let user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
      console.log(user.password);
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Sign a token
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        getenv("JWT"), // Store this secret safely
        { expiresIn: "24h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
  static async postRegister(req, res) {
    const { name, password, email, roleName } = req.body;
    // Check if the user exists
    try {
      let user = await User.findOne({ where: { email } });
      if (user) {
        console.log(user);
        return res.status(400).json({ msg: "User already exists" });
      }

      // Check for role
      const roleRecord = await Role.findOne({ where: { name: roleName } });
      if (!roleRecord) {
        return res.status(400).json({ msg: "Invalid role" });
      }
      const roleId = roleRecord.id;
      const userId = uuidv4();

      // Create a new user instance
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = await User.create({
        id: userId,
        name,
        email,
        password: hashedPassword,
        roleId,
        isActive: true,
      });
      res.status(201).json({ msg: "User Created Successfuly" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }

  static async isLoggedIn(req, res) {
    return res.status(200).json({ msg: "User is logged in" });
  }
}

module.exports = AuthController;
