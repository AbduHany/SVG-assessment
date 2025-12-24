import { Layout, Menu, Button, Typography } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: "/products", label: "Products" },
  { key: "/clients", label: "Clients" },
  { key: "/orders", label: "Orders" },
  { key: "/comments", label: "Comments" },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout className="min-h-screen!">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="px-4 py-4">
          <Typography.Title level={4} className="text-white!">
            Admin Panel
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(info) => navigate(info.key)}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between bg-white px-6">
          <Typography.Text className="text-lg! text-white! font-semibold!">
            Overview
          </Typography.Text>
          <Button onClick={handleLogout}>Logout</Button>
        </Header>
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
