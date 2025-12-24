import {
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  createOrder,
  deleteOrder,
  fetchOrders,
  updateOrder,
} from "../store/orderSlice";
import type { Order, OrderItem, Payment } from "../store/orderSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchClients } from "../store/clientSlice";
import { fetchProducts } from "../store/productSlice";
import { resolvePermissions } from "../utils/permissionChecker";

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderFormValues {
  clientId: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: Payment["paymentMethod"];
  paymentStatus?: Payment["status"];
  status: Order["status"];
}

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const { items: orders, status } = useAppSelector((state) => state.orders);
  const { items: clients } = useAppSelector((state) => state.clients);
  const { items: products } = useAppSelector((state) => state.products);
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm<OrderFormValues>();
  const watchedItems = Form.useWatch("items", form);

  const { canView, canCreate, canUpdate, canDelete } = useMemo(
    () => resolvePermissions(permissions ?? [], "orders", isAdmin),
    [permissions, isAdmin]
  );

  useEffect(() => {
    if (status === "idle" && orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length]);

  useEffect(() => {
    if (clients.length === 0) {
      dispatch(fetchClients());
    }
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, clients.length, products.length]);

  const paymentStatusFallback = (status: Order["status"]) =>
    status === "completed" ? "completed" : "pending";

  const handleSubmitOrder = async (values: OrderFormValues) => {
    const items: OrderItem[] = values.items.map((item) => {
      const product = products.find((current) => current.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name,
        quantity: Number(item.quantity),
        price: Number(product?.price ?? 0),
      };
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const paymentStatus =
      values.paymentStatus ?? paymentStatusFallback(values.status);

    const payload = {
      clientId: values.clientId,
      items,
      totalAmount,
      status: values.status,
      payment: {
        paymentMethod: values.paymentMethod,
        amount: totalAmount,
        status: paymentStatus,
      },
    };

    const result = editingOrder
      ? await dispatch(updateOrder({ id: editingOrder.id, updates: payload }))
      : await dispatch(createOrder(payload));

    if (
      (editingOrder && updateOrder.fulfilled.match(result)) ||
      (!editingOrder && createOrder.fulfilled.match(result))
    ) {
      message.success(
        editingOrder
          ? "Order updated successfully"
          : "Order placed successfully"
      );
      setIsModalOpen(false);
      setEditingOrder(null);
      form.resetFields();
    } else {
      message.error(
        editingOrder ? "Failed to update order" : "Failed to place order"
      );
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const result = await dispatch(deleteOrder(orderId));
    if (deleteOrder.fulfilled.match(result)) {
      message.success("Order deleted successfully");
    } else {
      message.error("Failed to delete order");
    }
  };

  const handleOpenCreate = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({
      items: [{ quantity: 1 }],
      paymentMethod: "cash",
      paymentStatus: "pending",
      status: "pending",
    });
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
    form.setFieldsValue({
      clientId: order.clientId,
      items:
        order.items?.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })) ?? [],
      paymentMethod: order.payments?.[0]?.paymentMethod ?? "cash",
      paymentStatus:
        order.payments?.[0]?.status ?? paymentStatusFallback(order.status),
      status: order.status,
    });
  };

  const computedTotal = useMemo(() => {
    if (!watchedItems?.length) {
      return 0;
    }

    return watchedItems.reduce((sum, item) => {
      const product = products.find(
        (current) => current.id === item?.productId
      );
      const price = Number(product?.price ?? 0);
      const quantity = Number(item?.quantity ?? 0);
      return sum + price * quantity;
    }, 0);
  }, [products, watchedItems]);

  const columns = useMemo(
    () => [
      { title: "Order ID", dataIndex: "id", key: "id" },
      {
        title: "Client",
        dataIndex: "client",
        key: "client",
        render: (_: unknown, record: Order) =>
          record.client?.name ??
          clients.find((client) => client.id === record.clientId)?.name ??
          "Unknown",
      },
      {
        title: "Items",
        dataIndex: "items",
        key: "items",
        render: (items: OrderItem[] | undefined) => (
          <div>
            {(items ?? []).map((item, index) => (
              <div key={`${item.productId}-${index}`}>
                <span>
                  {item.quantity}x {item.product?.name ?? item.productName}
                </span>
                <Text type="secondary" className="ml-2">
                  ${Number(item.price ?? 0).toFixed(2)} ea
                </Text>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Payment",
        dataIndex: "payments",
        key: "payments",
        render: (payments: Payment[] | undefined) => {
          const payment = payments?.[0];
          if (!payment) {
            return "-";
          }

          const paymentStatus = payment.status ?? "completed";

          return (
            <Space size={[0, 8]} wrap>
              <Tag color="blue">{payment.paymentMethod.toUpperCase()}</Tag>
              <Tag color={paymentStatus === "completed" ? "green" : "orange"}>
                {paymentStatus.toUpperCase()}
              </Tag>
            </Space>
          );
        },
      },
      {
        title: "Total",
        dataIndex: "totalAmount",
        key: "totalAmount",
        render: (value: number) => (
          <Text strong>${Number(value ?? 0).toFixed(2)}</Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (statusValue: Order["status"]) => (
          <Tag color={statusValue === "completed" ? "green" : "orange"}>
            {statusValue.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: Order) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              disabled={!canUpdate}
            />
            <Popconfirm
              title="Delete product?"
              onConfirm={() => handleDeleteOrder(record.id)}
              disabled={!canDelete}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={!canDelete}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [clients]
  );

  if (!canView) {
    return (
      <Card className="text-center p-12">
        <Title level={4}>Access Denied</Title>
        <Text>You do not have permission to view orders.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Orders</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          disabled={!canCreate}
        >
          Place Order
        </Button>
      </div>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={status === "loading"}
        className="card-shadow bg-white rounded-lg overflow-hidden"
      />

      <Modal
        title={editingOrder ? "Edit Order" : "Place New Order"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitOrder}>
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: "Client is required" }]}
          >
            <Select placeholder="Select a client">
              {clients.map((client) => (
                <Option key={client.id} value={client.id}>
                  {client.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List
            name="items"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value.length < 1) {
                    return Promise.reject(
                      new Error("Add at least one product")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div className="space-y-3">
                {fields.map((field) => (
                  <Space key={field.key} align="start">
                    <Form.Item
                      {...field}
                      name={[field.name, "productId"]}
                      rules={[{ required: true, message: "Select a product" }]}
                    >
                      <Select
                        placeholder="Select a product"
                        className="min-w-55"
                      >
                        {products.map((product) => (
                          <Option key={product.id} value={product.id}>
                            {product.name} - ${product.price}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "quantity"]}
                      rules={[
                        { required: true, message: "Quantity is required" },
                      ]}
                    >
                      <InputNumber min={1} className="w-24" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <Button onClick={() => remove(field.name)} danger>
                        Remove
                      </Button>
                    ) : null}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add({ quantity: 1 })}>
                  Add another product
                </Button>
                <Form.ErrorList errors={errors} />
                <div className="flex justify-end">
                  <Text strong>Total: ${computedTotal.toFixed(2)}</Text>
                </div>
              </div>
            )}
          </Form.List>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: "Select a payment method" }]}
          >
            <Select placeholder="Select payment method">
              <Option value="card">Card</Option>
              <Option value="cash">Cash</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentStatus"
            label="Payment Status"
            rules={[{ required: true, message: "Select a payment status" }]}
          >
            <Select placeholder="Select payment status">
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Order Status"
            rules={[{ required: true, message: "Select a status" }]}
          >
            <Select placeholder="Select order status">
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingOrder(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"}
            >
              {editingOrder ? "Save Order" : "Place Order"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
