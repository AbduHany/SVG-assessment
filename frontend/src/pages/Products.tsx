import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../store/productSlice";
import type { ProductInput, Product } from "../store/productSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resolvePermissions } from "../utils/permissionChecker";

const { Title, Text } = Typography;

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const { items: products, status } = useAppSelector((state) => state.products);
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const { canView, canCreate, canUpdate, canDelete } = useMemo(
    () => resolvePermissions(permissions ?? [], "products", isAdmin),
    [permissions, isAdmin]
  );

  useEffect(() => {
    if (status === "idle" && products.length === 0) {
      dispatch(fetchProducts());
    }
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) {
      message.success("Product deleted successfully");
    } else {
      message.error("Failed to delete product");
    }
  };

  const onFinish = async (values: ProductInput) => {
    if (editingProduct) {
      const result = await dispatch(
        updateProduct({ id: editingProduct.id, updates: values })
      );
      if (updateProduct.fulfilled.match(result)) {
        message.success("Product updated");
        setIsModalOpen(false);
      } else {
        message.error("Failed to update product");
      }
      return;
    }

    const result = await dispatch(createProduct(values));
    if (createProduct.fulfilled.match(result)) {
      message.success("Product added");
      setIsModalOpen(false);
    } else {
      message.error("Failed to add product");
    }
  };

  const columns = useMemo(
    () => [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Description", dataIndex: "description", key: "description" },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (value: number) => `$${Number(value).toFixed(2)}`,
      },
      { title: "Stock", dataIndex: "stock", key: "stock" },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: Product) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={!canUpdate}
            />
            <Popconfirm
              title="Delete product?"
              onConfirm={() => handleDelete(record.id)}
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
    [canDelete, canUpdate]
  );

  if (!canView) {
    return (
      <Card className="text-center p-12">
        <Title level={4}>Access Denied</Title>
        <Text>You do not have permission to view products.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Products</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={!canCreate}
        >
          Add Product
        </Button>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={status === "loading"}
        className="card-shadow bg-white rounded-lg overflow-hidden"
      />

      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Product name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Product Description"
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Price is required" }]}
          >
            <InputNumber prefix="$" style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="stock"
            label="Stock"
            rules={[{ required: true, message: "Stock is required" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"}
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
