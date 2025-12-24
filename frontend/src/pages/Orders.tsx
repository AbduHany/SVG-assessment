import {
  Button,
  Checkbox,
  Form,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { createOrder, fetchOrders } from "../store/orderSlice";
import type { Order, OrderItem } from "../store/orderSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchClients } from "../store/clientSlice";
import { fetchProducts } from "../store/productSlice";
import { resolvePermissions } from "../utils/permissionChecker";

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderFormValues {
  clientId: string;
  products: string[];
  paymentMethods: string[];
}

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const { items: orders, status } = useAppSelector((state) => state.orders);
  const { items: clients } = useAppSelector((state) => state.clients);
  const { items: products } = useAppSelector((state) => state.products);
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<OrderFormValues>();

  const { canCreate } = useMemo(
    () => resolvePermissions(permissions ?? [], "orders", isAdmin),
    [permissions, isAdmin]
  );

  useEffect(() => {
    if (status === "idle" && orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length, status]);

  useEffect(() => {
    if (clients.length === 0) {
      dispatch(fetchClients());
    }
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, clients.length, products.length]);

  const handleCreateOrder = async (values: OrderFormValues) => {
    const selectedProducts = values.products
      .map((productId) => products.find((product) => product.id === productId))
      .filter(Boolean);

    const items: OrderItem[] = selectedProducts.map((product) => ({
      productId: product!.id,
      productName: product!.name,
      quantity: 1,
      price: product!.price,
    }));

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const notes = values.paymentMethods?.length
      ? `Payment methods: ${values.paymentMethods.join(", ")}`
      : undefined;

    const result = await dispatch(
      createOrder({
        clientId: values.clientId,
        items,
        totalAmount,
        status: "pending",
        notes,
      })
    );

    if (createOrder.fulfilled.match(result)) {
      message.success("Order placed successfully");
      setIsModalOpen(false);
      form.resetFields();
    } else {
      message.error("Failed to place order");
    }
  };

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
                {item.quantity}x {item.product?.name ?? item.productName}
              </div>
            ))}
          </div>
        ),
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
        title: "Payment",
        dataIndex: "notes",
        key: "notes",
        render: (notes: string | undefined) => {
          if (!notes) {
            return "-";
          }
          const trimmed = notes.replace(/^Payment methods:\s*/i, "");
          const methods = trimmed
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

          return (
            <Space size={[0, 8]} wrap>
              {methods.map((method) => (
                <Tag key={method} color="blue">
                  {method}
                </Tag>
              ))}
            </Space>
          );
        },
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
    ],
    [clients]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Orders</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
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
        title="Place New Order"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrder}>
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

          <Form.Item
            name="products"
            label="Products"
            rules={[{ required: true, message: "Select at least one product" }]}
          >
            <Select mode="multiple" placeholder="Select products">
              {products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentMethods"
            label="Payment Methods (Select 1 or 2)"
            rules={[{ required: true, message: "Select a payment method" }]}
          >
            <Checkbox.Group>
              <div className="flex flex-col gap-2">
                <Checkbox value="Credit Card">Credit Card</Checkbox>
                <Checkbox value="Cash">Cash</Checkbox>
                <Checkbox value="Bank Transfer">Bank Transfer</Checkbox>
              </div>
            </Checkbox.Group>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"}
            >
              Place Order
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
