import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Job, LoadStatus } from './types';
import URLs from '../config/urls';
import api from '../apis/api';

export type JobListParams = {
  page: number;
  limit: number;
};

export const getJobList = createAsyncThunk(
  'home/job-list',
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

export const getJobDetail = createAsyncThunk(
  'home/product-detail',
  async (params: { project_id: number }, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.jobDetail,
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

export const jobApply = createAsyncThunk(
  'home/job-apply',
  async (data: FormData, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.jobApply,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      });
      return response.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type homeState = {
  jobListLoading: LoadStatus;
  jobDetailLoading: LoadStatus;
  jobApplyLoading: LoadStatus;

  jobList: Job[];
  totalCountJobs: number;
  jobDetail: Job | undefined;
  error: any;
};

const homeState: homeState = {
  jobListLoading: 'idle',
  jobDetailLoading: 'idle',
  jobApplyLoading: 'idle',

  jobList: [],
  totalCountJobs: 10,
  jobDetail: undefined,

  error: null,
};

export const homeSlice = createSlice({
  name: 'home',
  initialState: homeState,
  reducers: {},
  extraReducers: builder => {
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
          state.jobList = state.jobList.concat(action.payload.jobs);
        }
        state.totalCountJobs = action.payload.total ?? 10;
      })
      .addCase(getJobList.rejected, state => {
        state.jobListLoading = 'failed';
      });

    // Job Details
    builder
      .addCase(getJobDetail.pending, (state, action) => {
        state.jobDetailLoading = 'loading';
        if (state.jobDetail?.id !== action.meta.arg.project_id) {
          state.jobDetail = undefined;
        }
      })
      .addCase(getJobDetail.fulfilled, (state, action) => {
        state.jobDetailLoading = 'loaded';
        state.jobDetail = action.payload;
      })
      .addCase(getJobDetail.rejected, (state, action) => {
        state.jobDetailLoading = 'failed';
        state.error = action.error;
      });

    // Job Apply
    builder
      .addCase(jobApply.pending, (state) => {
        state.jobApplyLoading = 'loading';
      })
      .addCase(jobApply.fulfilled, (state) => {
        state.jobApplyLoading = 'loaded';
      })
      .addCase(jobApply.rejected, (state, action) => {
        state.jobApplyLoading = 'failed';
        state.error = action.error;
      });
  },
});

export const homeReducer = homeSlice.reducer;
