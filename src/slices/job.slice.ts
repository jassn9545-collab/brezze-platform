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

export const getJobDetail = createAsyncThunk(
  'job/product-detail',
  async (params: { job_id: number }, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.jobDetail,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      return response.data.data.job;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type HireJobParams = {
  job_id: number;
  bid_id: number;
};
export const hireJob = createAsyncThunk(
  'job/hire-job',
  async (params: HireJobParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.hireJob,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      navigationRef.resetRoot({
        index: 1,
        routes: [{ name: 'Drawer' }, { name: 'HireHistory' }],
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
  jobDetailLoading: LoadStatus;
  hireJobLoading: LoadStatus;

  jobList: Job[];
  totalCountJobs: number;
  jobDetail: Job | undefined;

  error: any;
};

const jobState: JobState = {
  createloading: 'idle',
  jobListLoading: 'idle',
  jobDetailLoading: 'idle',
  hireJobLoading: 'idle',

  jobList: [],
  totalCountJobs: 10,
  jobDetail: undefined,

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
        if (state.jobDetail?.id !== action.meta.arg.job_id) {
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


    // Hire Job
    builder
      .addCase(hireJob.pending, state => {
        state.hireJobLoading = 'loading';
      })
      .addCase(hireJob.fulfilled, state => {
        state.hireJobLoading = 'loaded';
      })
      .addCase(hireJob.rejected, (state, action) => {
        state.hireJobLoading = 'failed';
        state.error = action.payload;
      });
  },
});

export const jobReducer = jobSlice.reducer;
