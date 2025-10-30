import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import appwriteService from "../appwrite/config";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (userId) => {
    const profile = await appwriteService.getProfile(userId);
    return profile;
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async ({ userId, payload }) => {
    const updatedProfile = await appwriteService.updateProfile(userId, payload);
    return updatedProfile;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;