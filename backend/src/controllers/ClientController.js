const dbClient = require("../utils/db");
const Client = dbClient.models.client;
const { v4: uuidv4 } = require("uuid");

class ClientController {
  static async getAll(req, res) {
    try {
      const clients = await Client.findAll({
        order: [["name", "ASC"]],
      });
      return res.status(200).json(clients);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async create(req, res) {
    try {
      const { name, email, phone, address } = req.body;

      const clientId = uuidv4();

      const client = await Client.create({
        id: clientId,
        name,
        email,
        phone,
        address,
      });

      return res.status(201).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, address } = req.body;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await client.update({
        name: name ?? client.name,
        email: email ?? client.email,
        phone: phone ?? client.phone,
        address: address ?? client.address,
      });

      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await client.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ClientController;
