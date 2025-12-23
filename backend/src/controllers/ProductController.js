const dbClient = require("../utils/db");
const Product = dbClient.models.product;
const { v4: uuidv4 } = require("uuid");

class ProductController {
  static async getAll(req, res) {
    try {
      const products = await Product.findAll({
        order: [["name", "ASC"]],
      });
      return res.status(200).json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, price, stock, imageUrl } = req.body;

      const productId = uuidv4();

      const product = await Product.create({
        name,
        description,
        price,
        stock,
        imageUrl,
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, stock, imageUrl } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await product.update({
        name: name ?? product.name,
        description: description ?? product.description,
        price: price ?? product.price,
        stock: stock ?? product.stock,
        imageUrl: imageUrl ?? product.imageUrl,
      });

      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await product.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ProductController;
