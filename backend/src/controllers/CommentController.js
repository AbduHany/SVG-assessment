const dbClient = require("../utils/db");
const Comment = dbClient.models.comment;
const User = dbClient.models.user;
const { v4: uuidv4 } = require("uuid");

class CommentController {
  static async getAll(req, res) {
    try {
      const comments = await Comment.findAll({
        include: [{ model: User, as: "user" }],
        order: [["created_at", "DESC"]],
      });
      return res.status(200).json(comments);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const comment = await Comment.findByPk(id, {
        include: [{ model: User, as: "user" }],
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      return res.status(200).json(comment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getByUserId(req, res) {
    try {
      const { userId } = req.params;
      const comments = await Comment.findAll({
        where: { userId },
        include: [{ model: User, as: "user" }],
        order: [["created_at", "DESC"]],
      });
      return res.status(200).json(comments);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { content } = req.body;

      if (!userId || !content) {
        return res
          .status(400)
          .json({ message: "userId, and content are required" });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const commentId = uuidv4();

      const comment = await Comment.create({
        id: commentId,
        userId,
        content,
      });

      return res.status(201).json(comment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { content } = req.body;

      if (!content || !userId) {
        return res
          .status(400)
          .json({ message: "content and userId are required" });
      }

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await comment.update({
        userId: userId ?? comment.userId,
        content: content ?? comment.content,
      });

      return res.status(200).json(comment);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = CommentController;
