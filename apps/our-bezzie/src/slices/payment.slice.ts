// import RazorpayCheckout from 'react-native-razorpay';
// import URLs from '../config/urls';
// import { colors } from '../theme';
// import { LoadStatus, UserData } from './types';
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import api from '../apis/api';
// import { AddBankAccountParams } from '../apis/schema';
// import { resetAll } from './comman.action';
// import { navigationRef } from '../navigators';
// import { updateBankById } from './schema';

// export interface MyAccountResponse {
//   id: number;
//   user_id: string;
//   account_number: string;
//   ifsc_code: string;
//   bank_name: string;
//   account_holder_name: string;
//   created_at: string;
//   modify_at: string;
//   branch_name: string;
//   account_type: string;
//   is_primary: boolean;
// }

// export const startPayment = async (
//   amount: number,
//   profile: UserData,
//   onSuccess: (data: { razorpay_payment_id: string }) => void,
//   onFailure: (error: any) => void,
// ) => {
//   const options = {
//     description: 'Payment requested by Gandharva',
//     image:
//       'https://hirephpdeveloperindia.com/goldapp/public/uploads/1769419970.png',
//     currency: 'INR',
//     key: URLs.razorPayKey,
//     amount: amount * 100,
//     name: 'Gandharva',
//     prefill: {
//       email: profile?.email ?? '',
//       contact: `${profile?.country_code ?? ''}${profile?.phone ?? ''}`,
//       name: profile?.name ?? '',
//     },
//     theme: { color: colors.primary },
//   };

//   try {
//     const data = await RazorpayCheckout.open(options);
//     onSuccess(data);
//   } catch (error) {
//     onFailure(error);
//   }
// };

// type AddBankAccountPayload = {
//   params: AddBankAccountParams;
//   type: 'add' | 'edit';
// };

// export const addBankDetail = createAsyncThunk(
//   'payment/add-bank-detail',
//   async ({ params, type }: AddBankAccountPayload, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: type === 'edit' ? URLs.editBankAccount : URLs.addBankAccount,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       thunkAPI.dispatch(getBankAccounts());
//       navigationRef.goBack();
//       return response.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getBankAccounts = createAsyncThunk(
//   'payment/get-bank-accounts',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.bankAccountList,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       return response.data.data as MyAccountResponse[];
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const markPrimaryAccount = createAsyncThunk(
//   'payment/mark-bank-account-primary',
//   async (params: { account_id: number }, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.markPrimaryAccount,
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

// export const deleteBankAccount = createAsyncThunk(
//   'payment/delete-bank-account',
//   async (params: { account_id: number }, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.deleteBankAcount,
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
// export type PaymentState = {
//   adding: LoadStatus;
//   loading: LoadStatus;
//   markPrimaryLoading: LoadStatus;
//   deleteAccountLoading: LoadStatus;

//   myaccount: MyAccountResponse[];

//   error: any;
// };

// const paymentState: PaymentState = {
//   adding: 'idle',
//   loading: 'idle',
//   markPrimaryLoading: 'idle',
//   deleteAccountLoading: 'idle',

//   myaccount: [],

//   error: null,
// };

// export const paymentSlice = createSlice({
//   name: 'payment',
//   initialState: paymentState,
//   reducers: {},
//   extraReducers: builder => {
//     // Reset All
//     builder.addCase(resetAll, () => paymentState);

//     // Add Bank Detail
//     builder
//       .addCase(addBankDetail.pending, state => {
//         state.adding = 'loading';
//       })
//       .addCase(addBankDetail.fulfilled, state => {
//         state.adding = 'loaded';
//       })
//       .addCase(addBankDetail.rejected, (state, action) => {
//         state.adding = 'failed';
//         state.error = action.payload;
//       });

//     // Get bank accounts
//     builder
//       .addCase(getBankAccounts.pending, state => {
//         state.loading = 'loading';
//       })
//       .addCase(getBankAccounts.fulfilled, (state, action) => {
//         state.loading = 'loaded';
//         state.myaccount = action.payload;
//       })
//       .addCase(getBankAccounts.rejected, (state, action) => {
//         state.loading = 'failed';
//         state.error = action.payload;
//       });

//     // Mark primary account
//     builder
//       .addCase(markPrimaryAccount.pending, state => {
//         state.markPrimaryLoading = 'loading';
//       })
//       .addCase(markPrimaryAccount.fulfilled, (state, action) => {
//         const id = action.meta.arg.account_id;
//         if (state.myaccount) {
//           state.myaccount.forEach(account => {
//             account.is_primary = false;
//           });
//           updateBankById(state.myaccount, id, account => {
//             account.is_primary = true;
//           });
//         }
//         state.markPrimaryLoading = 'loaded';
//       })
//       .addCase(markPrimaryAccount.rejected, (state, action) => {
//         state.markPrimaryLoading = 'failed';
//         state.error = action.payload;
//       });

//     // Mark primary account
//     builder
//       .addCase(deleteBankAccount.pending, state => {
//         state.deleteAccountLoading = 'loading';
//       })
//       .addCase(deleteBankAccount.fulfilled, (state, action) => {
//         const id = action.meta.arg.account_id;
//         if (state.myaccount) {
//           state.myaccount = state.myaccount.filter(item => item.id !== id);
//         }
//         state.deleteAccountLoading = 'loaded';
//       })
//       .addCase(deleteBankAccount.rejected, (state, action) => {
//         state.deleteAccountLoading = 'failed';
//         state.error = action.payload;
//       });
//   },
// });

// export const paymentReducer = paymentSlice.reducer;
// export const paymentActions = paymentSlice.actions;
