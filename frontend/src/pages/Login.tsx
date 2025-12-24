import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth, login } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(checkAuth());
      navigate("/products", { replace: true });
    }
  }, []);

  const handleFinish = (values: { email: string; password: string }) => {
    dispatch(login(values));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow">
        <div className="mb-6 text-center">
          <Typography.Title level={3}>
            Sign in to SVG mini-CRM platform
          </Typography.Title>
          <Typography.Text type="secondary">
            Use your account to access the dashboard.
          </Typography.Text>
        </div>

        {error && (
          <div className="mb-2">
            <Alert type="error" title={error} showIcon />
          </div>
        )}
        <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email is required" }]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={status === "loading"}
            block
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
