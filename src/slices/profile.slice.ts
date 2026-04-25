import { createSlice, createAsyncThunk, } from '@reduxjs/toolkit';
import api from '../apis/api';
import URLs from '../config/urls';
import { LoadStatus } from './types';
import '../utils/toast';

// Customer Profile API action
export const getCustomerProfile = createAsyncThunk(
  'profile/customer-profile',
  async (_, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.customerProfile,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.data.profile
;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Update Customer Profile API action
export const updateCustomerProfile = createAsyncThunk(
  'profile/update-customer-profile',
  async (params: {
    name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    pincode: string;
    dob: string;
  }, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.updateCustomerProfile,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      toast.show(response.data.message, { type: 'success' });
      return response.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type ProfileState = {
  customerProfile: any;
  customerProfileLoading: LoadStatus;
  updateCustomerProfileLoading: LoadStatus;
  error: any;
};

const initialState: ProfileState = {
  customerProfile: null,
  customerProfileLoading: 'idle',
  updateCustomerProfileLoading: 'idle',
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearCustomerProfile: (state) => {
      state.customerProfile = null;
      state.customerProfileLoading = 'idle';
      state.error = null;
    },
    resetUpdateCustomerProfileLoading: (state) => {
      state.updateCustomerProfileLoading = 'idle';
    },
  },
  extraReducers: (builder) => {
    // Customer Profile
    builder
      .addCase(getCustomerProfile.pending, (state) => {
        state.customerProfileLoading = 'loading';
      })
      .addCase(getCustomerProfile.fulfilled, (state, action) => {
        state.customerProfileLoading = 'loaded';
        console.log('Customer Profile API Response:', action.payload);
        state.customerProfile = action.payload;
      })
      .addCase(getCustomerProfile.rejected, (state, action) => {
        state.customerProfileLoading = 'failed';
        state.error = action.payload;
      });
    
    // Update Customer Profile
    builder
      .addCase(updateCustomerProfile.pending, (state) => {
        state.updateCustomerProfileLoading = 'loading';
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.updateCustomerProfileLoading = 'loaded';
        state.customerProfile = action.payload.data?.profile || state.customerProfile;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.updateCustomerProfileLoading = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCustomerProfile, resetUpdateCustomerProfileLoading } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
