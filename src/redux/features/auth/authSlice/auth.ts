import { createSlice } from "@reduxjs/toolkit";

export type AuthInitialState = {
  loading: boolean;
  userInfo: {
    email: string | null;
    uid: string | null;
  };
  userToken: string | null;
  success: boolean;
};

const initialState: AuthInitialState = {
  loading: false,
  userInfo: {
    email: null,
    uid: null,
  },
  userToken: null,
  success: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    saveSesion: (state, action) => {
      state.userInfo = action.payload;
      state.success = true;
    },
    removeSesion: (state, _) => {
      state = initialState;
    },
  },
  extraReducers: {},
});

export const { saveSesion, removeSesion } = authSlice.actions;

export default authSlice.reducer;
