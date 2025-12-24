import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentsState {
  comments: Comment[];
}

const initialState: CommentsState = {
  comments: [],
};

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addComment: {
      reducer: (state, action: PayloadAction<Comment>) => {
        state.comments = [action.payload, ...state.comments];
      },
      prepare: (payload: Omit<Comment, "id" | "createdAt">) => ({
        payload: {
          id: nanoid(),
          createdAt: new Date().toISOString(),
          ...payload,
        },
      }),
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(
        (comment) => comment.id !== action.payload
      );
    },
  },
});

export const { addComment, deleteComment } = commentsSlice.actions;

export default commentsSlice.reducer;
