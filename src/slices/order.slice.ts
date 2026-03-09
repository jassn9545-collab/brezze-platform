// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { LoadStatus, Order } from './types';
// import URLs from '../config/urls';
// import api from '../apis/api';
// import { resetAll } from './comman.action';
// import { navigationRef } from '../navigators';

// // export interface CreateOrderParams {
// //   razorpay_payment_id: string;
// // }
// export const createOrder = createAsyncThunk(
//   'order/create-order',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.createOrder,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       // navigationRef.resetRoot({
//       //   index: 1,
//       //   routes: [{ name: 'Drawer' }, { name: 'Orders' }],
//       // });
//       navigationRef.resetRoot({
//         index: 0,
//         routes: [
//           {
//             name: 'Thankyou',
//             params: {
//               type: 'cart',
//               desc: response.data.message,
//             },
//           },
//         ],
//       });
//       return response.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getOrderList = createAsyncThunk(
//   'order/order-list',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.orderList,
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

// export const createCustomOrder = createAsyncThunk(
//   'order/create-custom-order',
//   async (data: FormData, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.createCustomOrder,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         data,
//       });
//       navigationRef.goBack();
//       return response.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getCustomOrderList = createAsyncThunk(
//   'order/custom-order-list',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.customOrderList,
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

// export type OrderState = {
//   createOrderLoading: LoadStatus;
//   orderListLoading: LoadStatus;
//   createCustomOrderLoading: LoadStatus;
//   customOrderListLoading: LoadStatus;

//   orderList: Order[];
//   customOrderList: Order[];

//   error: any;
// };

// const orderState: OrderState = {
//   createOrderLoading: 'idle',
//   orderListLoading: 'idle',
//   createCustomOrderLoading: 'idle',
//   customOrderListLoading: 'idle',

//   orderList: [],
//   customOrderList: [],

//   error: null,
// };

// export const orderSlice = createSlice({
//   name: 'order',
//   initialState: orderState,
//   reducers: {},
//   extraReducers: builder => {
//     // Reset All
//     builder.addCase(resetAll, () => orderState);

//     // create order
//     builder
//       .addCase(createOrder.pending, state => {
//         state.createOrderLoading = 'loading';
//       })
//       .addCase(createOrder.fulfilled, state => {
//         state.createOrderLoading = 'loaded';
//       })
//       .addCase(createOrder.rejected, (state, action) => {
//         state.createOrderLoading = 'failed';
//         state.error = action.payload;
//       });

//     // order list
//     builder
//       .addCase(getOrderList.pending, state => {
//         state.orderListLoading = 'loading';
//       })
//       .addCase(getOrderList.fulfilled, (state, action) => {
//         state.orderListLoading = 'loaded';
//         state.orderList = action.payload;
//       })
//       .addCase(getOrderList.rejected, (state, action) => {
//         state.orderListLoading = 'failed';
//         state.error = action.error;
//       });

//     // create custom order
//     builder
//       .addCase(createCustomOrder.pending, state => {
//         state.createCustomOrderLoading = 'loading';
//       })
//       .addCase(createCustomOrder.fulfilled, state => {
//         state.createCustomOrderLoading = 'loaded';
//       })
//       .addCase(createCustomOrder.rejected, (state, action) => {
//         state.createCustomOrderLoading = 'failed';
//         state.error = action.payload;
//       });

//     // custom order list
//     builder
//       .addCase(getCustomOrderList.pending, state => {
//         state.customOrderListLoading = 'loading';
//       })
//       .addCase(getCustomOrderList.fulfilled, (state, action) => {
//         state.customOrderListLoading = 'loaded';
//         state.customOrderList = action.payload;
//       })
//       .addCase(getCustomOrderList.rejected, (state, action) => {
//         state.customOrderListLoading = 'failed';
//         state.error = action.error;
//       });
//   },
// });

// export const orderReducer = orderSlice.reducer;
