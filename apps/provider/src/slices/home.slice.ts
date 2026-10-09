import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Job, LoadStatus } from './types';
import URLs from '../config/urls';
import api from '../apis/api';
import { navigationRef } from '../navigators';
import { updateItemById } from './schema';

export type Pagination = {
  page: number;
  limit: number;
  latitude?: number;
  longitude?: number;
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
      return response.data.data;
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
        data: JSON.stringify(params),
      });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const getApplyJobs = createAsyncThunk(
  'home/apply-jobs',
  async (params: Pagination, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.applyJobs,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      console.log('response.data.data', response.data.data);
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const getActiveJob = createAsyncThunk(
  'home/active-jobs',
  async (params: Pagination, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.activeJobs,
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

export const getCompleteJobs = createAsyncThunk(
  'home/complete-jobs',
  async (params: Pagination, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.completeJobs,
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

export const submitJob = createAsyncThunk(
  'job/submit-job',
  async (data: FormData, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.submitJob,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      });
      toast.show(response.data.message, { type: 'success' });
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: 'Drawer' }],
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
  savedJobsLoading: LoadStatus;
  applyJobsLoading: LoadStatus;
  activeJobsLoading: LoadStatus;
  completeJobsLoading: LoadStatus;
  submitJobLoading: LoadStatus;

  jobList: Job[];
  totalCountJobs: number;
  jobDetail: Job | undefined;

  savedJobs: Job[];
  savedJobTotalCount: number;

  applyJobs: Job[];
  applyJobTotalCount: number;

  activeJobs: Job[];
  totalActivePage: number;

  completeJobs: Job[];
  totalCompletePage: number;

  isCalled: boolean;

  error: any;
};

const homeState: homeState = {
  jobListLoading: 'idle',
  jobDetailLoading: 'idle',
  jobApplyLoading: 'idle',
  savedJobsLoading: 'idle',
  activeJobsLoading: 'idle',
  applyJobsLoading: 'idle',
  completeJobsLoading: 'idle',
  submitJobLoading: 'idle',

  jobList: [],
  totalCountJobs: 10,
  jobDetail: undefined,

  savedJobs: [],
  savedJobTotalCount: 10,

  applyJobs: [],
  applyJobTotalCount: 10,

  activeJobs: [],
  totalActivePage: 10,

  completeJobs: [],
  totalCompletePage: 10,

  isCalled: true,

  error: null,
};

export const homeSlice = createSlice({
  name: 'home',
  initialState: homeState,
  reducers: {
    setCalledHome: (state, action) => {
      state.isCalled = action.payload;
    },
  },
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
      .addCase(jobApply.fulfilled, (state, action) => {
        state.jobApplyLoading = 'loaded';
        const projectId = action.payload?.id;
        const jobDetail = state.jobDetail;
        if (jobDetail && jobDetail.id === projectId) {
          jobDetail.job_applied = true;
        }
        if (projectId && state.jobList) {
          updateItemById(state.jobList, projectId, job => {
            job.job_applied = true;
          });
        }
        if (projectId && state.savedJobs) {
          updateItemById(state.savedJobs, projectId, job => {
            job.job_applied = true;
          });
        }
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
      // APPLY JOBS LISTING
      if (state.applyJobs) {
        updateItemById(state.applyJobs, project_id, job => {
          job.saved = true;
        });
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
      // APPLY JOBS LISTING
      if (state.applyJobs) {
        updateItemById(state.applyJobs, project_id, job => {
          job.saved = false;
        });
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
        state.savedJobTotalCount = action.payload.total ?? 10;
      })
      .addCase(mySavedJobs.rejected, (state, action) => {
        state.savedJobsLoading = 'failed';
        state.error = action.error;
      });

    // Apply Jobs
    builder
      .addCase(getApplyJobs.pending, state => {
        state.applyJobsLoading = 'loading';
      })
      .addCase(getApplyJobs.fulfilled, (state, action) => {
        state.applyJobsLoading = 'loaded';
        if (action.meta.arg.page === 1) {
          state.applyJobs = action.payload.jobs;
        } else {
          state.applyJobs = state.applyJobs.concat(action.payload.jobs);
        }
        state.applyJobTotalCount = action.payload.total ?? 10;
      })
      .addCase(getApplyJobs.rejected, (state, action) => {
        state.applyJobsLoading = 'failed';
        state.error = action.error;
      });

    // Active Jobs
    builder
      .addCase(getActiveJob.pending, state => {
        state.activeJobsLoading = 'loading';
      })
      .addCase(getActiveJob.fulfilled, (state, action) => {
        state.activeJobsLoading = 'loaded';
        if (action.meta.arg.page === 1) {
          state.activeJobs = action.payload?.jobs ?? [];
        } else {
          state.activeJobs = state.activeJobs.concat(action.payload?.jobs ?? []);
        }
        state.totalActivePage = action.payload?.total_pages ?? 1;
      })
      .addCase(getActiveJob.rejected, (state, action) => {
        state.activeJobsLoading = 'failed';
        state.error = action.error;
      });

    // Complete Jobs
    builder
      .addCase(getCompleteJobs.pending, state => {
        state.completeJobsLoading = 'loading';
      })
      .addCase(getCompleteJobs.fulfilled, (state, action) => {
        state.completeJobsLoading = 'loaded';
        if (action.meta.arg.page === 1) {
          state.completeJobs = action.payload?.jobs ?? [];
        } else {
          state.completeJobs = state.completeJobs.concat(action.payload?.jobs ?? []);
        }
        state.totalCompletePage = action.payload?.total_pages ?? 1;
      })
      .addCase(getCompleteJobs.rejected, (state, action) => {
        state.completeJobsLoading = 'failed';
        state.error = action.error;
      });

    // Submit Job
    builder
      .addCase(submitJob.pending, state => {
        state.submitJobLoading = 'loading';
      })
      .addCase(submitJob.fulfilled, state => {
        state.submitJobLoading = 'loaded';
      })
      .addCase(submitJob.rejected, (state, action) => {
        state.submitJobLoading = 'failed';
        state.error = action.error;
      });
  },
});

export const homeReducer = homeSlice.reducer;
export const homeActions = homeSlice.actions;
