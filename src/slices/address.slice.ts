// import {
//   AddAddressParams,
//   AddressDataType,
// } from './address.types';
// import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

// import {LoadStatus} from './types';
// import URLs from '../config/urls';
// import api from '../apis/api';

// export const getSavedAddresses = createAsyncThunk(
//   'address/saved',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.address,
//         headers: {
//           'Content-Type': 'application/json',
//           version: 2,
//         },
//       });
//       const data = response.data.data as AddressDataType[];
//       return data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const addNewAddress = createAsyncThunk(
//   'address/add-new',
//   async (params: AddAddressParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.addAdress,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       thunkAPI.dispatch(getSavedAddresses());
//       return response.data as AddressDataType;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const removeAddress = createAsyncThunk(
//   'address/remove',
//   async (params: {_id: string}, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.removeAddress,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       thunkAPI.dispatch(getSavedAddresses());
//       return response.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const editAddress = createAsyncThunk(
//   'address/edit',
//   async (params: AddAddressParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.editAddress,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       thunkAPI.dispatch(getSavedAddresses());
//       return response.data as AddressDataType;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export type RecentAddressPayload = {
//   type: 'dropOff' | 'pickUp';
//   limit: number;
//   page: number;
// };

// // export const getRecentAddress = createAsyncThunk(
// //   'address/recent',
// //   async (params: RecentAddressPayload, thunkAPI) => {
// //     try {
// //       const response = await api({
// //         method: 'POST',
// //         url: URLs.recentAddress,
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         data: JSON.stringify(params),
// //       });
// //       return response.data.data as RecentAddress[];
// //     } catch (error) {
// //       throw thunkAPI.rejectWithValue(error);
// //     }
// //   },
// // );

// export const saveAddressOrder = createAsyncThunk(
//   'address/reorder',
//   async (params: {ids: string[]}, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.reorderAddress,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       return response.data.data as AddressDataType[];
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export type AddresState = {
//   loading: LoadStatus;
//   removing: LoadStatus;
//   saved: AddressDataType[];
//   // recent: RecentAddress[];
//   error: any;
// };

// const Addresstate: AddresState = {
//   loading: 'idle',
//   removing: 'idle',
//   saved: [],
//   // recent: [],
//   error: null,
// };

// export const Addresslice = createSlice({
//   name: 'address',
//   initialState: Addresstate,
//   reducers: {
//     resetLoading: state => {
//       state.loading = 'idle';
//     },
//     resetRemoveLoading: state => {
//       state.removing = 'idle';
//     },
//   },
//   extraReducers: builder => {
//     // Get Saved Address
//     builder
//       .addCase(getSavedAddresses.pending, state => {
//         state.loading = 'loading';
//       })
//       .addCase(getSavedAddresses.fulfilled, (state, action) => {
//         state.loading = 'loaded';
//         state.saved = action.payload;
//       })
//       .addCase(getSavedAddresses.rejected, (state, action) => {
//         state.loading = 'failed';
//         state.error = action.payload;
//       });
//     // Add New Address
//     builder
//       .addCase(addNewAddress.pending, state => {
//         state.loading = 'loading';
//       })
//       .addCase(addNewAddress.fulfilled, state => {
//         state.loading = 'loaded';
//       })
//       .addCase(addNewAddress.rejected, (state, action) => {
//         state.loading = 'failed';
//         state.error = action.payload;
//       });
//     // Edit Address
//     builder
//       .addCase(editAddress.pending, state => {
//         state.loading = 'loading';
//       })
//       .addCase(editAddress.fulfilled, state => {
//         state.loading = 'loaded';
//       })
//       .addCase(editAddress.rejected, (state, action) => {
//         state.loading = 'failed';
//         state.error = action.payload;
//       });
//     // Remove Address
//     builder
//       .addCase(removeAddress.pending, state => {
//         state.removing = 'loading';
//       })
//       .addCase(removeAddress.fulfilled, state => {
//         state.removing = 'loaded';
//       })
//       .addCase(removeAddress.rejected, (state, action) => {
//         state.removing = 'failed';
//         state.error = action.payload;
//       });
//     // // Recent Addresses
//     // builder
//     //   .addCase(getRecentAddress.pending, state => {
//     //     state.loading = 'loading';
//     //   })
//     //   .addCase(getRecentAddress.fulfilled, (state, action) => {
//     //     state.loading = 'loaded';
//     //     state.recent = action.payload;
//     //   })
//     //   .addCase(getRecentAddress.rejected, (state, action) => {
//     //     state.loading = 'failed';
//     //     state.error = action.payload;
//     //   });
//     // Reorder Addresses
//     builder
//       .addCase(saveAddressOrder.pending, state => {
//         state.loading = 'loading';
//       })
//       .addCase(saveAddressOrder.fulfilled, (state, action) => {
//         state.loading = 'loaded';
//         state.saved = action.payload;
//       })
//       .addCase(saveAddressOrder.rejected, (state, action) => {
//         state.loading = 'failed';
//         state.error = action.payload;
//       });
//   },
// });

// export const addressReducer = Addresslice.reducer;
