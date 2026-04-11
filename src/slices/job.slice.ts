import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { LoadStatus } from './types';
import URLs from '../config/urls';
import api from '../apis/api';
import { navigationRef } from '../navigators';

export const createJob = createAsyncThunk(
  'job/create-job',
  async (data: FormData, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.createJob,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      });
      navigationRef.resetRoot({
        index: 1,
        routes: [{ name: 'Drawer' }, { name: 'JobPostList' }],
      });
      return response.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type JobState = {
  createloading: LoadStatus;
  error: any;
};

const jobState: JobState = {
  createloading: 'idle',
  error: null,
};

export const jobSlice = createSlice({
  name: 'job',
  initialState: jobState,
  reducers: {},
  extraReducers: builder => {
    // create job
    builder
      .addCase(createJob.pending, state => {
        state.createloading = 'loading';
      })
      .addCase(createJob.fulfilled, state => {
        state.createloading = 'loaded';
      })
      .addCase(createJob.rejected, (state, action) => {
        state.createloading = 'failed';
        state.error = action.payload;
      });
  },
});

export const jobReducer = jobSlice.reducer;
