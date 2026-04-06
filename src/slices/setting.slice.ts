import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { LoadStatus } from './types';
import URLs from '../config/urls';
import api from '../apis/api';
import { getAuthorization } from './auth.slice';

export interface BasicData {
  skills: Skill[]
  proof_type: ProofType[]
}

export interface Skill {
  id: number
  name: string
  slug: string
  photo: string
}

export interface ProofType {
  name: string
}


export const getBasicSettings = createAsyncThunk(
  'setting/basic',
  async (_, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.basicSetting,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = response.data.data as BasicData;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    } finally {
      thunkAPI.dispatch(getAuthorization());
    }
  },
);

export type SettingState = {
  loading: LoadStatus;
  basic: BasicData | null;
  error: any;
};

const settingState: SettingState = {
  loading: 'idle',
  basic: null,
  error: null,
};

export const settingSlice = createSlice({
  name: 'setting',
  initialState: settingState,
  reducers: {},
  extraReducers: builder => {
    // Get Basic Setting
    builder
      .addCase(getBasicSettings.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getBasicSettings.fulfilled, (state, action) => {
        state.loading = 'loaded';
        state.basic = action.payload;
      })
      .addCase(getBasicSettings.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});

export const settingReducer = settingSlice.reducer;
