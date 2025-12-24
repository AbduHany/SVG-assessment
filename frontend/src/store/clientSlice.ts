import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axiosClient";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export type ClientInput = Omit<Client, "id">;

interface ClientsState {
  items: Client[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: ClientsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchClients = createAsyncThunk("clients/fetchAll", async () => {
  const response = await api.get<Client[]>("/clients");
  return response.data;
});

export const createClient = createAsyncThunk(
  "clients/create",
  async (payload: ClientInput) => {
    const response = await api.post<Client>("/clients", payload);
    return response.data;
  }
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async ({ id, updates }: { id: string; updates: ClientInput }) => {
    const response = await api.put<Client>(`/clients/${id}`, updates);
    return response.data;
  }
);

export const deleteClient = createAsyncThunk(
  "clients/delete",
  async (id: string) => {
    await api.delete(`/clients/${id}`);
    return id;
  }
);

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load clients";
      })
      .addCase(createClient.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = [...state.items, action.payload];
      })
      .addCase(createClient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to create client";
      })
      .addCase(updateClient.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to update client";
      })
      .addCase(deleteClient.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to delete client";
      });
  },
});

export default clientsSlice.reducer;
