import { IBodyVerifyOTP } from "@/models/verify.model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IBodyVerifyOTP = {
  email: "",
  OTP: "",
  token: "",
};

const verifyOTPSlice = createSlice({
  name: "verifyOTP",
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setOTP: (state, action: PayloadAction<string>) => {
      state.OTP = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { setEmail, setOTP, setToken } = verifyOTPSlice.actions;

export default verifyOTPSlice.reducer;
