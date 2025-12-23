const dbClient = require("../utils/db");
const Comment = dbClient.models.comment;
const Order = dbClient.models.order;
const User = dbClient.models.user;
const { v4: uuidv4 } = require("uuid");

class CommentController {
  static async getAll(req, res) {
    try {
      const comments = await Comment.findAll({
        include: [
          { model: Order, as: "order" },
          { model: User, as: "user" },
        ],
        order: [["created_at", "DESC"]],
      });
      return res.status(200).json(comments);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const comment = await Comment.findByPk(id, {
        include: [
          { model: Order, as: "order" },
          { model: User, as: "user" },
        ],
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      return res.status(200).json(comment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async create(req, res) {
    try {
      const { orderId, userId, content } = req.body;

      if (!orderId || !userId || !content) {
        return res
          .status(400)
          .json({ message: "orderId, userId, and content are required" });
      }

      const [order, user] = await Promise.all([
        Order.findByPk(orderId),
        User.findByPk(userId),
      ]);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const commentId = uuidv4();

      const comment = await Comment.create({
        id: commentId,
        orderId,
        userId,
        content,
      });

      return res.status(201).json(comment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { orderId, userId, content } = req.body;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
      }

      if (userId) {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      await comment.update({
        orderId: orderId ?? comment.orderId,
        userId: userId ?? comment.userId,
        content: content ?? comment.content,
      });

      return res.status(200).json(comment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      await comment.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = CommentController;
