import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import AuthService from "@/shared/auth/AuthService";

interface User {
  _id: string;
  fullName: string;
  email: string;
  // biome-ignore lint/suspicious/noExplicitAny: generic data
  [k: string]: any;
}

interface Role {
  _id: string;
  name: string;
  code: string;
  // biome-ignore lint/suspicious/noExplicitAny: generic data
  [k: string]: any;
}

interface AuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getMe();
      return response; // Assuming response structure matches IResp<IUser> from AuthService
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch user profile");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<{ user: User; role: Role }>) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        // biome-ignore lint/suspicious/noExplicitAny: response structure
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          // Adjust based on actual response structure from AuthService.getMe
          // AuthService returns IResp<IUser>, where IUser has userId and roleId
          if (action.payload?.data) {
            const { userId, roleId } = action.payload.data;
            state.user = userId;
            state.role = roleId;
            state.isAuthenticated = true;
          }
        },
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { setAuthenticated, setUser, logout } = authSlice.actions;

export default authSlice.reducer;
