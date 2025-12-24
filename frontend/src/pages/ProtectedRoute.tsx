import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { checkAuth } from "../store/authSlice";

const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const { token, status } = useAppSelector((state) => state.auth);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!token) {
      hasCheckedAuth.current = false;
      return;
    }

    if (!hasCheckedAuth.current && status === "idle") {
      hasCheckedAuth.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch, status, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
