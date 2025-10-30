import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import postsReducer from "./postsSlice";
import profileReducer from "./profileSlice";

const store = configureStore({
    reducer: {
    auth: authReducer,
    posts: postsReducer,
    profile: profileReducer,
    },
});

export default store;
