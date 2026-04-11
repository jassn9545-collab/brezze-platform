import { AuthStackParamList, navigationRef } from '../navigators';
import { LoadStatus, UserDetailsResponse } from './types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { resetAll } from './comman.action';
import api from '../apis/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAQ } from '../screens';
import { Linking } from 'react-native';
import { handleInviteURL } from '../utils/util';
import URLs from '../config/urls';
import {
  BasicUserDetailParams,
  ForgotPasswordParam,
  Registration,
  ResetPasswordParams,
  Signin,
} from '../apis/schema';

export const getAuthorization = createAsyncThunk(
  'auth/authrization',
  async (_, thunkAPI) => {
    try {
      const isAuthorized = await AsyncStorage.getItem('authorized');
      const token = await AsyncStorage.getItem('token');
      const lang = await AsyncStorage.getItem('language');
      const initialUrl = await Linking.getInitialURL();
      const inviteCode = handleInviteURL(initialUrl);
      return { authorized: isAuthorized === 'true', token, inviteCode, lang };
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const userLogin = createAsyncThunk(
  'auth/login',
  async (params: Signin, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.login,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      const data = response?.data?.data;
      if (data?.is_verification_completed) {
        await AsyncStorage.setItem('authorized', 'true');
      } else if (data?.basic_info && data?.profile_pic && data?.proof) {
        navigationRef.navigate('DocumentReview');
      } else {
        navigationRef.navigate('MyDocuments');
      }
      await AsyncStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const userRegistration = createAsyncThunk(
  'auth/registration',
  async (params: Registration, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.registration,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      navigationRef.navigate('Verification', {
        ...params,
        user_id: response.data.data.user_id,
        serviceSid: '',
        from: 'signup',
      });
      toast.show(response.data.message, { type: 'success' });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type UserVerificationParam = {
  email: string;
  serviceSid?: string;
  otp?: string;
  phone?: string;
  user_type?: string;
};

export const userVerification = createAsyncThunk(
  'auth/verification',
  async (params: UserVerificationParam, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.verifyUser,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      const data = response.data.data;
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user_id', data?.user?.id?.toString());

      navigationRef.resetRoot({
        index: 1,
        routes: [{ name: 'Signup' }, { name: 'MyDocuments' }],
      });
      return data as UserDetailsResponse;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const userBasicDetail = createAsyncThunk(
  'auth/user-basic-detail',
  async (params: BasicUserDetailParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.basicDetail,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      navigationRef.goBack();
      return response.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const uploadProfilePhoto = createAsyncThunk(
  'auth/upload-profile-photo',
  async (data: FormData, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.uploadProfile,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      });
      navigationRef.navigate('CommonSucess', {
        from: 'faceVerification',
      });
      return response.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const uploadUserVerificationID = createAsyncThunk(
  'auth/upload-verification-id',
  async (data: FormData, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.userVerificationID,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      });
      navigationRef.goBack();
      return response.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgot-password',
  async (params: ForgotPasswordParam, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.forgotPassword,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      navigationRef.navigate('Verification', {
        email: params.email,
        user_id: response.data.data.user_id,
        serviceSid: '',
        from: 'forgotPassword',
      });
      toast.show(response.data.message, { type: 'success' });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const resendOTP = createAsyncThunk(
  'auth/resend-otp',
  async (params: UserVerificationParam, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.resendOtp,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      toast.show(response.data.message, { type: 'success' });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const resendUserVerifyOTP = createAsyncThunk(
  'auth/resend-user-verify-otp',
  async (params: UserVerificationParam, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.resendUserVerifyOtp,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      toast.show(response.data.message, { type: 'success' });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export type VerifyOTPParam = {
  user_id?: number;
  otp: string;
  serviceSid?: string;
};

export const verifyOTP = createAsyncThunk(
  'auth/verify-otp',
  async (params: VerifyOTPParam, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.verifyOtp,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      toast.show(response.data.message, { type: 'success' });
      return response.data.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// export const getProfile = createAsyncThunk(
//   'auth/profile',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.profile,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       return response.data as UserDetailsResponse;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const updateProfile = createAsyncThunk(
//   'auth/update-profile',
//   async (data: FormData, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.updateProfile,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         data,
//       });
//       toast.show(response.data.message, { type: 'success' });
//       return response.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

export const resetPassword = createAsyncThunk(
  'auth/reset-password',
  async (params: ResetPasswordParams, thunkAPI) => {
    try {
      const response = await api({
        method: 'POST',
        url: URLs.resetPassword,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(params),
      });
      toast.show(response.data.message, { type: 'success' });
      return response?.data?.data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// export const userLogout = createAsyncThunk(
//   'auth/logout',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.logout,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       await AsyncStorage.setItem('authorized', 'false');
//       await AsyncStorage.removeItem('token');
//       delete api.defaults.headers.Authorization;
//       thunkAPI.dispatch(resetAll());
//       return response.data;
//     } catch (error) {
//       await AsyncStorage.setItem('authorized', 'false');
//       await AsyncStorage.removeItem('token');
//       delete api.defaults.headers.Authorization;
//       thunkAPI.dispatch(resetAll());
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const deleteAccount = createAsyncThunk(
//   'auth/delete',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.deleteUser,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       await AsyncStorage.setItem('authorized', 'false');
//       await AsyncStorage.multiRemove([
//         'mobile',
//         'password',
//         'country',
//         'token',
//       ]);
//       thunkAPI.dispatch(resetAll());
//       return response.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export interface FAQParams {
//   type: string;
// }

// export const getFaqs = createAsyncThunk(
//   'auth/faqs',
//   async (params: FAQParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.faq,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       return response.data.data as FAQ[];
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getReferEarnDetail = createAsyncThunk(
//   'auth/refer-earn-detail',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.referEarn,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getNotifications = createAsyncThunk(
//   'auth/get-notifications',
//   async (params: { page: number }, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.getUserNotifications,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       return response.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

export type AuthState = {
  initialRouteName: keyof AuthStackParamList;
  isAuthorized: Boolean;
  booting: LoadStatus;
  inviteCode?: string;

  userRegistrationLoading: LoadStatus;
  userVerificationLoading: LoadStatus;
  userBasicDetailLoading: LoadStatus;
  uploadProfilePhotoLoading: LoadStatus;
  uploadUserVerificationIDLoading: LoadStatus;

  loading: LoadStatus;
  myProfile?: UserDetailsResponse;
  updateLoading: LoadStatus;
  resendVerifyOTPLoading: LoadStatus;
  logoutLoading: LoadStatus;
  forgotPasswordLoading: LoadStatus;
  resendOTPLoading: LoadStatus;
  verifyOTPLoading: LoadStatus;
  resetPasswordLoading: LoadStatus;

  faqLoading: LoadStatus;
  faqs: FAQ[];

  referEarnLoading: LoadStatus;
  withDrawLoading: LoadStatus;
  userNotificationsLoading: LoadStatus;
  userNotifications: any[];
  totalNotifications: number;

  error: any;
};

const authState: AuthState = {
  initialRouteName: 'Walkthrough',
  isAuthorized: false,
  booting: 'loading',

  userRegistrationLoading: 'idle',
  userVerificationLoading: 'idle',
  userBasicDetailLoading: 'idle',
  uploadProfilePhotoLoading: 'idle',
  uploadUserVerificationIDLoading: 'idle',

  loading: 'idle',
  updateLoading: 'idle',
  resendVerifyOTPLoading: 'idle',
  logoutLoading: 'idle',
  forgotPasswordLoading: 'idle',
  resendOTPLoading: 'idle',
  verifyOTPLoading: 'idle',
  resetPasswordLoading: 'idle',

  faqLoading: 'idle',
  faqs: [],

  referEarnLoading: 'idle',
  withDrawLoading: 'idle',
  userNotificationsLoading: 'idle',
  userNotifications: [],
  totalNotifications: 10,

  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: authState,
  reducers: {
    autoLogout: _ => ({
      ...authState,
      initialRouteName: 'Login',
      booting: 'loaded',
    }),

    clearLoginLoading: state => {
      state.loading = 'idle';
    },
    resetUserVerificationLoading: state => {
      state.userVerificationLoading = 'idle';
    },
    resetUpdateLoading: state => {
      state.updateLoading = 'idle';
    },
    resetForgotPasswordLoading: state => {
      state.forgotPasswordLoading = 'idle';
    },
    resetVerifyOTPLoading: state => {
      state.verifyOTPLoading = 'idle';
    },
    resetResetPasswordLoading: state => {
      state.resetPasswordLoading = 'idle';
    },
    setAuthroized: (state, action) => {
      state.isAuthorized = action.payload;
    },
    setReferralCode: (state, action) => {
      state.inviteCode = action.payload;
    },
  },
  extraReducers: builder => {
    // Reset All
    builder.addCase(resetAll, () => authState);
    // Get Authorization
    builder
      .addCase(getAuthorization.fulfilled, (state, action) => {
        state.isAuthorized = action.payload.authorized;
        if (action.payload.authorized) {
          api.defaults.headers.Authorization = `Bearer ${action.payload.token}`;
          api.defaults.headers.lang = action.payload.lang ?? 'en';
        }
        if (action.payload.inviteCode) {
          state.inviteCode = action.payload.inviteCode;
        }
        state.booting = 'loaded';
      })
      .addCase(getAuthorization.rejected, (state, action) => {
        state.error = action.payload;
        state.booting = 'failed';
      });
    // User Login
    builder
      .addCase(userLogin.pending, state => {
        state.loading = 'loading';
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = 'loaded';
        if (action.payload?.is_verification_completed) {
          state.isAuthorized = true;
        }
        api.defaults.headers.Authorization = `Bearer ${action.payload.token}`;
        state.myProfile = action.payload;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });

    // User Registration
    builder
      .addCase(userRegistration.pending, state => {
        state.userRegistrationLoading = 'loading';
      })
      .addCase(userRegistration.fulfilled, state => {
        state.userRegistrationLoading = 'loaded';
      })
      .addCase(userRegistration.rejected, (state, action) => {
        state.userRegistrationLoading = 'failed';
        state.error = action.payload;
      });

    // User Verification
    builder
      .addCase(userVerification.pending, state => {
        state.userVerificationLoading = 'loading';
      })
      .addCase(userVerification.fulfilled, (state, action) => {
        api.defaults.headers.Authorization = `Bearer ${action.payload.token}`;
        state.myProfile = action.payload;
        state.userVerificationLoading = 'loaded';
      })
      .addCase(userVerification.rejected, (state, action) => {
        state.userVerificationLoading = 'failed';
        state.error = action.payload;
      });

    // User Basic Detail
    builder
      .addCase(userBasicDetail.pending, state => {
        state.userBasicDetailLoading = 'loading';
      })
      .addCase(userBasicDetail.fulfilled, state => {
        if (state.myProfile) {
          state.myProfile.basic_info = true;
        }
        state.userBasicDetailLoading = 'loaded';
      })
      .addCase(userBasicDetail.rejected, (state, action) => {
        state.userBasicDetailLoading = 'failed';
        state.error = action.payload;
      });

    // Upload Profile
    builder
      .addCase(uploadProfilePhoto.pending, state => {
        state.uploadProfilePhotoLoading = 'loading';
      })
      .addCase(uploadProfilePhoto.fulfilled, state => {
        if (state.myProfile) {
          state.myProfile.profile_pic = true;
        }
        state.uploadProfilePhotoLoading = 'loaded';
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.uploadProfilePhotoLoading = 'failed';
        state.error = action.payload;
      });

    // User Verification By ID
    builder
      .addCase(uploadUserVerificationID.pending, state => {
        state.uploadUserVerificationIDLoading = 'loading';
      })
      .addCase(uploadUserVerificationID.fulfilled, state => {
        if (state.myProfile) {
          state.myProfile.proof = true;
        }
        state.uploadUserVerificationIDLoading = 'loaded';
      })
      .addCase(uploadUserVerificationID.rejected, (state, action) => {
        state.uploadUserVerificationIDLoading = 'failed';
        state.error = action.payload;
      });

    // // User logout
    // builder
    //   .addCase(userLogout.pending, state => {
    //     state.logoutLoading = 'loading';
    //   })
    //   .addCase(userLogout.fulfilled, () => ({
    //     ...authState,
    //     logoutLoading: 'loaded',
    //     initialRouteName: 'Login',
    //     booting: 'loaded',
    //   }))
    //   .addCase(userLogout.rejected, (state, action) => {
    //     state.logoutLoading = 'failed';
    //     state.error = action.payload;
    //   });
    // // // User delete
    // // builder
    // //   .addCase(deleteAccount.pending, state => {
    // //     state.updateLoading = 'loading';
    // //   })
    // //   .addCase(deleteAccount.fulfilled, () => ({
    // //     ...authState,
    // //     updateLoading: 'loaded',
    // //     // initialRouteName: 'Login',
    // //     booting: 'loaded',
    // //   }))
    // //   .addCase(deleteAccount.rejected, (state, action) => {
    // //     state.updateLoading = 'failed';
    // //     state.error = action.payload;
    // //   });
    // Forgot Password
    builder
      .addCase(forgotPassword.pending, state => {
        state.forgotPasswordLoading = 'loading';
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.forgotPasswordLoading = 'loaded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = 'failed';
        state.error = action.payload;
      });
    // Resend Password
    builder
      .addCase(resendOTP.pending, state => {
        state.resendOTPLoading = 'loading';
      })
      .addCase(resendOTP.fulfilled, state => {
        state.resendOTPLoading = 'loaded';
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.resendOTPLoading = 'failed';
        state.error = action.payload;
      });
    // Resend User Verify Password
    builder
      .addCase(resendUserVerifyOTP.pending, state => {
        state.resendVerifyOTPLoading = 'loading';
      })
      .addCase(resendUserVerifyOTP.fulfilled, state => {
        state.resendVerifyOTPLoading = 'loaded';
      })
      .addCase(resendUserVerifyOTP.rejected, (state, action) => {
        state.resendVerifyOTPLoading = 'failed';
        state.error = action.payload;
      });
    // Verify OTP
    builder
      .addCase(verifyOTP.pending, state => {
        state.verifyOTPLoading = 'loading';
      })
      .addCase(verifyOTP.fulfilled, state => {
        state.verifyOTPLoading = 'loaded';
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.verifyOTPLoading = 'failed';
        state.error = action.payload;
      });
    // // User Profile
    // builder
    //   .addCase(getProfile.pending, state => {
    //     state.loading = 'loading';
    //   })
    //   .addCase(getProfile.fulfilled, (state, action) => {
    //     state.loading = 'loaded';
    //     state.myProfile = action.payload;
    //   })
    //   .addCase(getProfile.rejected, (state, action) => {
    //     state.loading = 'failed';
    //     state.error = action.payload;
    //   });
    // // Update Profile
    // builder
    //   .addCase(updateProfile.pending, state => {
    //     state.updateLoading = 'loading';
    //   })
    //   .addCase(updateProfile.fulfilled, (state, action) => {
    //     state.updateLoading = 'loaded';
    //     state.myProfile = action.payload;
    //   })
    //   .addCase(updateProfile.rejected, (state, action) => {
    //     state.updateLoading = 'failed';
    //     state.error = action.error;
    //   });
    // reset Password
    builder
      .addCase(resetPassword.pending, state => {
        state.resetPasswordLoading = 'loading';
      })
      .addCase(resetPassword.fulfilled, state => {
        state.resetPasswordLoading = 'loaded';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = 'failed';
        state.error = action.payload;
      });

    // // GET FAQs
    // builder
    //   .addCase(getFaqs.pending, state => {
    //     state.faqLoading = 'loading';
    //   })
    //   .addCase(getFaqs.fulfilled, (state, action) => {
    //     state.faqLoading = 'loaded';
    //     state.faqs = action.payload;
    //   })
    //   .addCase(getFaqs.rejected, (state, action) => {
    //     state.faqLoading = 'failed';
    //     state.error = action.payload;
    //   });

    // // GET REFER EARN DETAIL
    // builder
    //   .addCase(getReferEarnDetail.pending, state => {
    //     state.referEarnLoading = 'loading';
    //   })
    //   .addCase(getReferEarnDetail.fulfilled, (state, action) => {
    //     state.referEarnLoading = 'loaded';
    //     state.referEarnDetail = action.payload;
    //   })
    //   .addCase(getReferEarnDetail.rejected, (state, action) => {
    //     state.referEarnLoading = 'failed';
    //     state.error = action.payload;
    //   });

    // // Get user notifications
    // builder
    //   .addCase(getNotifications.pending, state => {
    //     state.userNotificationsLoading = 'loading';
    //   })
    //   .addCase(getNotifications.fulfilled, (state, action) => {
    //     state.userNotificationsLoading = 'loaded';
    //     if (action.meta.arg.page === 1) {
    //       state.userNotifications = action.payload.data;
    //     } else {
    //       state.userNotifications = state.userNotifications.concat(
    //         action.payload.data,
    //       );
    //     }
    //     state.totalNotifications = action.payload.totalcount ?? 0;
    //   })
    //   .addCase(getNotifications.rejected, (state, action) => {
    //     state.userNotificationsLoading = 'failed';
    //     state.error = action.error;
    //   });
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
