const dbClient = require("../utils/db");

const Order = dbClient.models.order;
const OrderItem = dbClient.models.orderItem;
const Payment = dbClient.models.payment;
const Product = dbClient.models.product;
const Client = dbClient.models.client;
const User = dbClient.models.user;

const buildOrderItems = async (items, transaction) => {
  if (!Array.isArray(items)) {
    return { itemsToCreate: [], totalAmount: 0 };
  }

  const itemsToCreate = [];
  let totalAmount = 0;

  for (const item of items) {
    const { productId, quantity } = item;

    if (!productId) {
      throw new Error("Product ID is required for order items");
    }

    const itemQuantity = Number(quantity);
    if (!Number.isFinite(itemQuantity) || itemQuantity <= 0) {
      throw new Error("Order item quantity must be greater than 0");
    }

    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      throw new Error("Product not found for order item");
    }

    const numericPrice = Number(product.price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      throw new Error("Order item price must be a valid number");
    }

    const subtotal = itemQuantity * numericPrice;
    totalAmount += subtotal;

    itemsToCreate.push({
      productId,
      quantity: itemQuantity,
      price: numericPrice,
      subtotal,
    });
  }

  return { itemsToCreate, totalAmount };
};

const buildPayment = (payment) => {
  if (!payment) {
    return null;
  }

  const { paymentMethod, amount, transactionId, status, paymentDate } = payment;

  if (!["cash", "card"].includes(paymentMethod)) {
    throw new Error("Payment method must be cash or card");
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw new Error("Payment amount must be a valid number");
  }

  return {
    paymentMethod,
    amount: numericAmount,
    transactionId,
    status,
    paymentDate,
  };
};

class OrderController {
  static async getAll(req, res) {
    try {
      const orders = await Order.findAll({
        include: [
          { model: Client, as: "client" },
          { model: User, as: "createdBy" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
          { model: Payment, as: "payments" },
        ],
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [
          { model: Client, as: "client" },
          { model: User, as: "createdBy" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
          { model: Payment, as: "payments" },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getByUserId(req, res) {
    try {
      const { userId } = req.params;
      const orders = await Order.findAll({
        where: { userId },
        include: [
          { model: Client, as: "client" },
          { model: User, as: "createdBy" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
          { model: Payment, as: "payments" },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getByClientId(req, res) {
    try {
      const { clientId } = req.params;
      const orders = await Order.findAll({
        where: { clientId },
        include: [
          { model: Client, as: "client" },
          { model: User, as: "createdBy" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
          { model: Payment, as: "payments" },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async create(req, res) {
    const transaction = await dbClient.sequelize.transaction();
    try {
      const { clientId, items, payment, status, notes, orderDate } = req.body;
      const { itemsToCreate, totalAmount } = await buildOrderItems(
        items,
        transaction
      );
      const paymentToCreate = buildPayment(payment);

      const order = await Order.create(
        {
          clientId,
          userId: req.user.id,
          status,
          notes,
          orderDate,
          totalAmount,
        },
        { transaction }
      );

      if (itemsToCreate.length > 0) {
        await OrderItem.bulkCreate(
          itemsToCreate.map((item) => ({
            ...item,
            orderId: order.id,
          })),
          { transaction }
        );
      }

      if (paymentToCreate) {
        await Payment.create(
          {
            ...paymentToCreate,
            orderId: order.id,
          },
          { transaction }
        );
      }

      await transaction.commit();

      const createdOrder = await Order.findByPk(order.id, {
        include: [
          { model: Client, as: "client" },
          { model: User, as: "createdBy" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
          { model: Payment, as: "payments" },
        ],
      });

      return res.status(201).json(createdOrder);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async update(req, res) {
    const transaction = await dbClient.sequelize.transaction();
    try {
      const { id } = req.params;
      const {
        clientId,
        items,
        payment,
        status,
        notes,
        orderDate,
        totalAmount,
      } = req.body;

      const order = await Order.findByPk(id, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      let updatedTotalAmount =
        totalAmount !== undefined ? totalAmount : order.totalAmount;

      if (items !== undefined) {
        const { itemsToCreate, totalAmount: computedTotal } =
          await buildOrderItems(items, transaction);
        updatedTotalAmount = computedTotal;

        await OrderItem.destroy({ where: { orderId: id }, transaction });

        if (itemsToCreate.length > 0) {
          await OrderItem.bulkCreate(
            itemsToCreate.map((item) => ({
              ...item,
              orderId: id,
            })),
            { transaction }
          );
        }
      }

      if (payment !== undefined) {
        const paymentToCreate = buildPayment(payment);
        await Payment.destroy({ where: { orderId: id }, transaction });

        if (paymentToCreate) {
          await Payment.create(
            {
              ...paymentToCreate,
              orderId: id,
            },
            { transaction }
          );
        }
      }

      await order.update(
        {
          clientId: clientId ?? order.clientId,
          status: status ?? order.status,
          notes: notes ?? order.notes,
          orderDate: orderDate ?? order.orderDate,
          totalAmount: updatedTotalAmount,
        },
        { transaction }
      );

      await transaction.commit();

      const updatedOrder = await Order.findByPk(order.id, {
        include: [
          { model: Client, as: "client" },
          { model: User, as: "createdBy" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
          { model: Payment, as: "payments" },
        ],
      });

      return res.status(200).json(updatedOrder);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async delete(req, res) {
    const transaction = await dbClient.sequelize.transaction();
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      await OrderItem.destroy({ where: { orderId: id }, transaction });
      await Payment.destroy({ where: { orderId: id }, transaction });
      await order.destroy({ transaction });

      await transaction.commit();
      return res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = OrderController;
