const jwt = require("jsonwebtoken");
const getenv = require("getenv");
const db = require("../utils/db");

const authenticate = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, getenv("JWT"));
    const user = await db.models.user.findByPk(decoded.user.id, {
      include: [
        { model: db.models.role, as: "role" },
        { model: db.models.permission, as: "permissions" },
      ],
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ msg: "User not found or inactive" });
    }

    req.user = user; // attach the full user object (with role & permissions)
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authenticate;
