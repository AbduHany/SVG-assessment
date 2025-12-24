import { Layout, Menu, Button, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
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
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout className="min-h-screen!">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="px-4 py-4">
          <Typography.Title level={4} className="text-white!">
            Welcome {user?.email}
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
        <Header className="flex items-center justify-end">
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
