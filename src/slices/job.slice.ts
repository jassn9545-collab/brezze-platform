import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ClientProfile, Job, LoadStatus } from './types';
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

export type CompleteJobParams = {
  job_id: number;
};
export const completeJob = createAsyncThunk(
  'job/complete-job',
  async (params: CompleteJobParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.completeJob,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      navigationRef.navigate('JobCompleted');
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type SubmitReviewParams = {
  project_id: string;
  star: string;
  review: string;
};
export const submitReview = createAsyncThunk(
  'job/submit-review',
  async (params: SubmitReviewParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.submitReview,
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

export type profileParams = {
  id: number;
};
export const getFreelancerProfile = createAsyncThunk(
  'job/freelancer-profile',
  async (params: profileParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.clientProfile,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      return response.data.data.profile;
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
  completeJobLoading: LoadStatus;
  submitReviewLoading: LoadStatus;
  clientProfileLoading: LoadStatus;

  jobList: Job[];
  totalCountJobs: number;
  jobDetail: Job | undefined;
  clientProfile: ClientProfile | undefined;

  error: any;
};

const jobState: JobState = {
  createloading: 'idle',
  jobListLoading: 'idle',
  jobDetailLoading: 'idle',
  hireJobLoading: 'idle',
  completeJobLoading: 'idle',
  submitReviewLoading: 'idle',
  clientProfileLoading: 'idle',

  jobList: [],
  totalCountJobs: 10,
  jobDetail: undefined,
  clientProfile: undefined,

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

    // Complete Job
    builder
      .addCase(completeJob.pending, state => {
        state.completeJobLoading = 'loading';
      })
      .addCase(completeJob.fulfilled, state => {
        state.completeJobLoading = 'loaded';
      })
      .addCase(completeJob.rejected, (state, action) => {
        state.completeJobLoading = 'failed';
        state.error = action.payload;
      });

    // Submit Review
    builder
      .addCase(submitReview.pending, state => {
        state.submitReviewLoading = 'loading';
      })
      .addCase(submitReview.fulfilled, state => {
        state.submitReviewLoading = 'loaded';
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitReviewLoading = 'failed';
        state.error = action.payload;
      });

    // Freelancer Profile
    builder
      .addCase(getFreelancerProfile.pending, state => {
        state.clientProfileLoading = 'loading';
      })
      .addCase(getFreelancerProfile.fulfilled, (state, action) => {
        state.clientProfileLoading = 'loaded';
        console.log('Freelancer Profile API Response:', action.payload);
        state.clientProfile = action.payload;
      })
      .addCase(getFreelancerProfile.rejected, (state, action) => {
        state.clientProfileLoading = 'failed';
        state.error = action.payload;
      });
  },
});

export const jobReducer = jobSlice.reducer;
