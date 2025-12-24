import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axiosClient";

interface AuthState {
  token: string | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  user: UserDetails | null;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  userId: string;
  resource: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

const initialState: AuthState = {
  token: localStorage.getItem("authToken"),
  status: "idle",
  error: null,
  user: {
    id: "",
    name: "",
    email: "",
    isAdmin: false,
    isActive: false,
    createdAt: "",
    updatedAt: "",
    permissions: [],
  },
};

// Logs user in and returns the token
export const login = createAsyncThunk(
  "/auth/login",
  async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data.token as string;
  }
);

// Check if the user is authenticated
export const checkAuth = createAsyncThunk("auth/check", async () => {
  const response = await api.get("/profile");
  return response.data as UserDetails;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.status = "idle";
      state.error = null;
      state.user = null;
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload;
        localStorage.setItem("authToken", action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(checkAuth.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Auth check failed";
        state.token = null;
        state.user = null;
        localStorage.removeItem("authToken");
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
