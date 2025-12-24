import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { checkAuth } from "../store/authSlice";

const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const { token, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && status === "idle") {
      dispatch(checkAuth());
    }
  }, [dispatch, status, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (status === "loading") {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
