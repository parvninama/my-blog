import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import appwriteService from "../appwrite/config";

const initialState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await appwriteService.getAllPosts();
    return response.documents || [];
  } catch (err) {
    return rejectWithValue(err.message || "Failed to fetch posts");
  }
});

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const post = await appwriteService.getPostById(postId);
      return post;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch post");
    }
  }
);

export const createPost = createAsyncThunk("posts/createPost", async (payload, { rejectWithValue }) => {
  try {
    const post = await appwriteService.createPost(payload);
    return post;
  } catch (err) {
    return rejectWithValue(err.message || "Failed to create post");
  }
});

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, payload }, { rejectWithValue }) => {
    try {
      const updatedPost = await appwriteService.updatePost(postId, payload);
      return updatedPost;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update post");
    }
  }
);

export const deletePost = createAsyncThunk("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    await appwriteService.deletePost(postId);
    return postId;
  } catch (err) {
    return rejectWithValue(err.message || "Failed to delete post");
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPosts.fulfilled, (state, action) => { state.loading = false; state.posts = action.payload; })
      .addCase(fetchPosts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchPostById.pending, (state) => { state.loading = true; state.error = null; state.currentPost = null; })
      .addCase(fetchPostById.fulfilled, (state, action) => { state.loading = false; state.currentPost = action.payload; })
      .addCase(fetchPostById.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.currentPost = null; })

      .addCase(createPost.fulfilled, (state, action) => { state.posts.unshift(action.payload); })

      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.$id === action.payload.$id);
        if (index !== -1) state.posts[index] = action.payload;
        if (state.currentPost?.$id === action.payload.$id) state.currentPost = action.payload;
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.$id !== action.payload);
        if (state.currentPost?.$id === action.payload) state.currentPost = null;
      });
  },
});

export const { clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;