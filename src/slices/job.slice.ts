import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Job, LoadStatus } from './types';
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

export type JobListParams = {
  page: number;
  limit: number;
};

export const getJobList = createAsyncThunk(
  'job/job-list',
  async (params: JobListParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.jobList,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type JobState = {
  createloading: LoadStatus;
  jobListLoading: LoadStatus;

  jobList: Job[];
  totalCountJobs: number;

  error: any;
};

const jobState: JobState = {
  createloading: 'idle',
  jobListLoading: 'idle',

  jobList: [],
  totalCountJobs: 10,

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

    // job list
    builder
      .addCase(getJobList.pending, state => {
        state.jobListLoading = 'loading';
      })
      .addCase(getJobList.fulfilled, (state, action) => {
        state.jobListLoading = 'loaded';
        if (action.meta.arg.page === 1) {
          state.jobList = action.payload.jobs;
        } else {
          state.jobList = state.jobList.concat(
            action.payload.jobs,
          );
        }

        state.totalCountJobs = action.payload.total ?? 10;
      })
      .addCase(getJobList.rejected, state => {
        state.jobListLoading = 'failed';
      });
  },
});

export const jobReducer = jobSlice.reducer;
