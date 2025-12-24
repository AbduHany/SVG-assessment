import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axiosClient";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: {
    name?: string;
  };
  productName?: string;
}

export interface Order {
  id: string;
  clientId: string;
  userId?: string;
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes?: string;
  orderDate?: string;
  client?: {
    name?: string;
  };
  items?: OrderItem[];
}

export type OrderInput = Omit<Order, "id"> & {
  items?: OrderItem[];
};

interface OrdersState {
  items: Order[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
  const response = await api.get<Order[]>("/orders");
  return response.data;
});

export const createOrder = createAsyncThunk(
  "orders/create",
  async (payload: OrderInput) => {
    const response = await api.post<Order>("/orders", payload);
    return response.data;
  }
);

export const updateOrder = createAsyncThunk(
  "orders/update",
  async ({ id, updates }: { id: string; updates: OrderInput }) => {
    const response = await api.put<Order>(`/orders/${id}`, updates);
    return response.data;
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (id: string) => {
    await api.delete(`/orders/${id}`);
    return id;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load orders";
      })
      .addCase(createOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = [...state.items, action.payload];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to create order";
      })
      .addCase(updateOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to update order";
      })
      .addCase(deleteOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to delete order";
      });
  },
});

export default ordersSlice.reducer;
