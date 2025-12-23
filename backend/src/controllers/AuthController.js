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

  static async isLoggedIn(req, res) {
    return res.status(200).json({ msg: "User is logged in" });
  }
}

module.exports = AuthController;
