import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Job, LoadStatus } from './types';
import URLs from '../config/urls';
import api from '../apis/api';
import { navigationRef } from '../navigators';
import { updateItemById } from './schema';

export type Pagination = {
  page: number;
  limit: number;
};

export const getJobList = createAsyncThunk(
  'home/job-list',
  async (params: Pagination, thunkAPI) => {
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
      navigationRef.navigate('JobApplySucessModal');
      return response.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type JobSavedParams = {
  project_id: number;
};

export const addToSavedJob = createAsyncThunk(
  'home/add-to-saved',
  async (params: JobSavedParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.addSavedJob,
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

export const removeFromSavedJob = createAsyncThunk(
  'home/remove-from-saved',
  async (params: JobSavedParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.removeSavedJob,
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

export const mySavedJobs = createAsyncThunk(
  'home/my-saved-jobs',
  async (params: Pagination, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.mySavedJobs,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type homeState = {
  jobListLoading: LoadStatus;
  jobDetailLoading: LoadStatus;
  jobApplyLoading: LoadStatus;
  savedJobsLoading: LoadStatus;

  jobList: Job[];
  totalCountJobs: number;
  jobDetail: Job | undefined;

  savedJobs: Job[];
  savedJobTotalCount: number;

  error: any;
};

const homeState: homeState = {
  jobListLoading: 'idle',
  jobDetailLoading: 'idle',
  jobApplyLoading: 'idle',
  savedJobsLoading: 'idle',

  jobList: [],
  totalCountJobs: 10,
  jobDetail: undefined,

  savedJobs: [],
  savedJobTotalCount: 10,

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
      .addCase(jobApply.pending, state => {
        state.jobApplyLoading = 'loading';
      })
      .addCase(jobApply.fulfilled, state => {
        state.jobApplyLoading = 'loaded';
      })
      .addCase(jobApply.rejected, (state, action) => {
        state.jobApplyLoading = 'failed';
        state.error = action.error;
      });

    // add to saved jobs
    builder.addCase(addToSavedJob.fulfilled, (state, action) => {
      const { project_id } = action.meta.arg;
      // HOME
      if (state.jobList) {
        updateItemById(state.jobList, project_id, job => {
          job.saved = true;
        });
      }
      // JOB DETAIL
      if (state.jobDetail?.id === project_id) {
        state.jobDetail.saved = true;
      }
    });

    // remove to wishlist
    builder.addCase(removeFromSavedJob.fulfilled, (state, action) => {
      const { project_id } = action.meta.arg;
      // HOME
      if (state.jobList) {
        updateItemById(state.jobList, project_id, job => {
          job.saved = false;
        });
      }
      // JOB DETAIL
      if (state.jobDetail?.id === project_id) {
        state.jobDetail.saved = false;
      }
      // SAVED LISTING
      if (state.savedJobs) {
        state.savedJobs = state.savedJobs.filter(
          item => item.id !== project_id,
        );
      }
    });

    // My Saved Jobs
    builder
      .addCase(mySavedJobs.pending, state => {
        state.savedJobsLoading = 'loading';
      })
      .addCase(mySavedJobs.fulfilled, (state, action) => {
        state.savedJobsLoading = 'loaded';
        if (action.meta.arg.page === 1) {
          state.savedJobs = action.payload.jobs;
        } else {
          state.savedJobs = state.jobList.concat(action.payload.jobs);
        }
        state.totalCountJobs = action.payload.total ?? 10;
      })
      .addCase(mySavedJobs.rejected, (state, action) => {
        state.savedJobsLoading = 'failed';
        state.error = action.error;
      });
  },
});

export const homeReducer = homeSlice.reducer;
