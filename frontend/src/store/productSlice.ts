import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axiosClient";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export type ProductInput = Omit<Product, "id">;

interface ProductsState {
  items: Product[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
  const response = await api.get<Product[]>("/products");
  return response.data;
});

export const createProduct = createAsyncThunk(
  "products/create",
  async (payload: ProductInput) => {
    const response = await api.post<Product>("/products", payload);
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, updates }: { id: string; updates: ProductInput }) => {
    const response = await api.put<Product>(`/products/${id}`, updates);
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string) => {
    await api.delete(`/products/${id}`);
    return id;
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load products";
      })
      .addCase(createProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = [...state.items, action.payload];
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to create product";
      })
      .addCase(updateProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to update product";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to delete product";
      });
  },
});

export default productsSlice.reducer;
