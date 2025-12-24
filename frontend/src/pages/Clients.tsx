import {
  Button,
  Form,
  Input,
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
  createClient,
  deleteClient,
  fetchClients,
  updateClient,
} from "../store/clientSlice";
import type { Client, ClientInput } from "../store/clientSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resolvePermissions } from "../utils/permissionChecker";

const { Title } = Typography;

const ClientsPage = () => {
  const dispatch = useAppDispatch();
  const { items: clients, status } = useAppSelector((state) => state.clients);
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form] = Form.useForm<ClientInput>();

  const { canView, canCreate, canUpdate, canDelete } = useMemo(
    () => resolvePermissions(permissions ?? [], "clients", isAdmin),
    [permissions, isAdmin]
  );

  useEffect(() => {
    if (status === "idle" && clients.length === 0) {
      dispatch(fetchClients());
    }
  }, [dispatch, clients.length]);

  const handleAdd = () => {
    setEditingClient(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Client) => {
    setEditingClient(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteClient(id));
    if (deleteClient.fulfilled.match(result)) {
      message.success("Client deleted");
    } else {
      message.error("Failed to delete client");
    }
  };

  const onFinish = async (values: ClientInput) => {
    if (editingClient) {
      const result = await dispatch(
        updateClient({ id: editingClient.id, updates: values })
      );
      if (updateClient.fulfilled.match(result)) {
        message.success("Client updated");
        setIsModalOpen(false);
      } else {
        message.error("Failed to update client");
      }
      return;
    }

    const result = await dispatch(createClient(values));
    if (createClient.fulfilled.match(result)) {
      message.success("Client added");
      setIsModalOpen(false);
    } else {
      message.error("Failed to add client");
    }
  };

  const columns = useMemo(
    () => [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Phone", dataIndex: "phone", key: "phone" },
      { title: "Address", dataIndex: "address", key: "address" },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: Client) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={!canUpdate}
            />
            <Popconfirm
              title="Delete client?"
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
    [canUpdate, canDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Clients</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={!canCreate}
        >
          Add Client
        </Button>
      </div>

      {canView ? (
        <Table
          dataSource={clients}
          columns={columns}
          rowKey="id"
          loading={status === "loading"}
          className="card-shadow bg-white rounded-lg overflow-hidden"
        />
      ) : (
        <Typography.Text type="warning">
          You don't have permission to view clients
        </Typography.Text>
      )}

      <Modal
        title={editingClient ? "Edit Client" : "Add Client"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Client Name"
            rules={[{ required: true, message: "Client name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Phone is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input.TextArea />
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

export default ClientsPage;
