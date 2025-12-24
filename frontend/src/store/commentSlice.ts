import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axiosClient";

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

interface CommentsState {
  items: Comment[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: CommentsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchComments = createAsyncThunk("comments/fetchAll", async () => {
  const response = await api.get<Comment[]>("/comments");
  return response.data;
});

export const createComment = createAsyncThunk(
  "comments/create",
  async ({ content }: { content: string }) => {
    const response = await api.post<Comment>("/comments", { content });
    return response.data;
  }
);

export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id: string) => {
    await api.delete(`/comments/${id}`);
    return id;
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load comments";
      })
      .addCase(createComment.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = [action.payload, ...state.items];
      })
      .addCase(createComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to create comment";
      })
      .addCase(deleteComment.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = state.items.filter(
          (comment) => comment.id !== action.payload
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to delete comment";
      });
  },
});

export default commentsSlice.reducer;
