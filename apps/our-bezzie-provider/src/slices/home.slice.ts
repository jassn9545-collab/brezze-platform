// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// import { resetAll } from './comman.action';
// import URLs from '../config/urls';
// import api from '../apis/api';
// import {
//   BookedGoldDetail,
//   Category,
//   HomeData,
//   LoadStatus,
//   MyWalletData,
//   MyWithdrawalsData,
//   Product,
//   Transaction,
// } from './types';
// import { sortKeys } from '../screens';
// import { updateProductById } from './schema';
// import { navigationRef } from '../navigators';

// export const getHomeData = createAsyncThunk(
//   'home/home-data',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.home,
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

// export const getCategories = createAsyncThunk(
//   'home/category-data',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.categories,
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

// export type ProductListParams = {
//   page: number;
//   limit: number;
//   category_id?: number;
//   search?: string;
//   order_by: sortKeys;
// };

// export const getProductList = createAsyncThunk(
//   'home/product-list',
//   async (params: ProductListParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.productList,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getProductDetail = createAsyncThunk(
//   'home/product-detail',
//   async (id: number, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.productDetail(id),
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

// export type AddCartParams = {
//   product_id: number;
//   quantity: number;
// };

// export const addToCart = createAsyncThunk(
//   'home/add-to-cart',
//   async (params: AddCartParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.addCart,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getCartDetail = createAsyncThunk(
//   'home/cart-detail',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.cartDetail,
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

// export type WishlistParams = {
//   product_id: number;
// };

// export const addToWishlist = createAsyncThunk(
//   'home/add-to-wishlist',
//   async (params: WishlistParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.addWishlist,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const removeToWishlist = createAsyncThunk(
//   'home/remove-to-wishlist',
//   async (params: WishlistParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.removeWishlist,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const myWishlist = createAsyncThunk(
//   'home/my-wishlist',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.myWishlist,
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

// export const getBookedGoldDetail = createAsyncThunk(
//   'home/booked-gold-detail',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.bookedGoldDetail,
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
// export interface BookGoldParams {
//   current_buy_rate: string;
//   amount: string;
//   gold_in_gm: string;
//   razorpay_payment_id: string;
// }
// export const bookGold = createAsyncThunk(
//   'home/book-gold',
//   async (params: BookGoldParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.bookGold,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       // navigationRef.navigate('Transection', {
//       //   type: 'gold',
//       //   heading: 'home.goldPaymentHistory',
//       //   investmentText: 'home.totalGoldInvestment',
//       //   histroyHeading: 'home.goldHistory',
//       // });
//       // toast.show(response.data.message, { type: 'success' });
//       navigationRef.resetRoot({
//         index: 0,
//         routes: [
//           {
//             name: 'Thankyou',
//             params: {
//               type: 'gold',
//               desc: response.data.message,
//             },
//           },
//         ],
//       });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export type TransactionParams = {
//   page: number;
//   type: 'sip' | 'gold' | 'silver';
// };

// export const getTransactions = createAsyncThunk(
//   'home/transactions',
//   async (params: TransactionParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: params.type === 'sip' ? URLs.sipTransaction : URLs.transections,
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

// export const sipTC = createAsyncThunk('home/sip-TC', async (_, thunkAPI) => {
//   try {
//     const response = await api({
//       method: 'GET',
//       url: URLs.sipTC,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     const data = response.data.data;
//     if (!data.is_accepted) {
//       navigationRef.resetRoot({
//         index: 1,
//         routes: [
//           { name: 'Drawer' },
//           {
//             name: 'TermsCondition',
//             params: {
//               from: 'sip',
//               type: 'terms',
//               data: data.policy,
//               title: 'profile.termsConditionsTitle',
//             },
//           },
//         ],
//       });
//     }
//     return data;
//   } catch (error) {
//     throw thunkAPI.rejectWithValue(error);
//   }
// });

// export const sipTCAccept = createAsyncThunk(
//   'home/sip-TC-Accept',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'GET',
//         url: URLs.sipTCAccept,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       navigationRef.resetRoot({
//         routes: [
//           {
//             name: 'Drawer',
//             params: {
//               screen: 'BottomTab',
//               params: {
//                 screen: 'Sip',
//               },
//             },
//           },
//         ],
//       });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export type CreateSipPaymentParams = {
//   amount: number;
//   razorpay_payment_id: string;
// };

// export const createSipPayment = createAsyncThunk(
//   'home/create-sip-payment',
//   async (params: CreateSipPaymentParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.makeSipPayment,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       // navigationRef.navigate('Transection', {
//       //   type: 'sip',
//       //   heading: 'home.sipPaymentHistory',
//       //   investmentText: 'home.totalSipInvestment',
//       //   histroyHeading: 'home.sipHistory',
//       // });
//       navigationRef.resetRoot({
//         index: 0,
//         routes: [
//           {
//             name: 'Thankyou',
//             params: {
//               type: 'sip',
//               desc: response.data.message,
//             },
//           },
//         ],
//       });
//       // toast.show(response.data.message, { type: 'success' });
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const myWallet = createAsyncThunk(
//   'home/my-wallet',
//   async (_, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.myWallet,
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

// export interface WithDrawSipAmountParams {
//   amount: number;
// }
// export const withDrawSipAmount = createAsyncThunk(
//   'home/withdraw-sip-amount',
//   async (params: WithDrawSipAmountParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.withdrawSipAmount,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       thunkAPI.dispatch(myWallet());
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export interface BuyGoldWithSipParams {
//   amount: number;
//   current_buy_rate: number;
//   gold_in_gm: number;
// }
// export const buyGoldWithSip = createAsyncThunk(
//   'home/buy-gold-with-sip',
//   async (params: BuyGoldWithSipParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.buyGoldWithSip,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       thunkAPI.dispatch(myWallet());
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export interface sellGoldParams {
//   amount: number;
//   current_sell_rate: number;
//   gold_in_gm: number;
// }
// export const sellGold = createAsyncThunk(
//   'home/sell-gold',
//   async (params: sellGoldParams, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.sellGold,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify(params),
//       });
//       thunkAPI.dispatch(myWallet());
//       return response.data.data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

// export const getWithdrawalList = createAsyncThunk(
//   'auth/get-withdrawal-list',
//   async (params: { page: number }, thunkAPI) => {
//     try {
//       const response = await api({
//         method: 'POST',
//         url: URLs.myWithdrawal,
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

// export type AuthState = {
//   homeLoading: LoadStatus;
//   categoryLoading: LoadStatus;
//   productListLoading: LoadStatus;
//   productDetailLoading: LoadStatus;
//   addToCartLoading: LoadStatus;
//   cartLoading: LoadStatus;
//   wishlistLoading: LoadStatus;
//   bookedGoldDetailLoading: LoadStatus;
//   bookGoldLoading: LoadStatus;
//   transactionsLoading: LoadStatus;
//   sipTCLoading: LoadStatus;
//   createSipPaymentLoading: LoadStatus;
//   myWalletLoading: LoadStatus;
//   withDrawSipAmountLoading: LoadStatus;
//   buyGoldWithSipLoading: LoadStatus;
//   sellGoldLoading: LoadStatus;
//   userWithdrawalLoading: LoadStatus;

//   baseURl: string;

//   homeData: HomeData | null;
//   categoryList: Category[];

//   totalcount: number;
//   productList: Product[];
//   productDetail: Product | undefined;
//   cart: Product[];
//   wishlist: Product[];
//   bookedGoldDetail: BookedGoldDetail | undefined;
//   transactions: Transaction[];
//   transactionsTotal: number;
//   totalTransactionAmount: number;
//   goldSpentAmount?: string;

//   myWalletData: MyWalletData | undefined;
//   userWithdrawal: MyWithdrawalsData[];
//   totalWithDrawals: number;

//   error: any;
// };

// const homeState: AuthState = {
//   homeLoading: 'idle',
//   categoryLoading: 'idle',
//   productListLoading: 'idle',
//   productDetailLoading: 'idle',
//   addToCartLoading: 'idle',
//   cartLoading: 'idle',
//   wishlistLoading: 'idle',
//   bookedGoldDetailLoading: 'idle',
//   bookGoldLoading: 'idle',
//   transactionsLoading: 'idle',
//   sipTCLoading: 'idle',
//   createSipPaymentLoading: 'idle',
//   myWalletLoading: 'idle',
//   withDrawSipAmountLoading: 'idle',
//   buyGoldWithSipLoading: 'idle',
//   sellGoldLoading: 'idle',
//   userWithdrawalLoading: 'idle',

//   baseURl: '',

//   homeData: null,
//   categoryList: [],

//   totalcount: 10,
//   productList: [],
//   productDetail: undefined,
//   cart: [],
//   wishlist: [],
//   bookedGoldDetail: undefined,
//   transactions: [],
//   transactionsTotal: 10,
//   totalTransactionAmount: 10,
//   myWalletData: undefined,
//   userWithdrawal: [],
//   totalWithDrawals: 10,
//   error: null,
// };

// export const homeSlice = createSlice({
//   name: 'home',
//   initialState: homeState,
//   reducers: {},
//   extraReducers: builder => {
//     // Reset All
//     builder.addCase(resetAll, () => homeState);

//     // home api
//     builder
//       .addCase(getHomeData.pending, state => {
//         state.homeLoading = 'loading';
//       })
//       .addCase(getHomeData.fulfilled, (state, action) => {
//         state.homeLoading = 'loaded';
//         state.baseURl = action.payload.image_base_url;
//         state.homeData = action.payload;
//       })
//       .addCase(getHomeData.rejected, (state, action) => {
//         state.homeLoading = 'failed';
//         state.error = action.payload;
//       });

//     // category api
//     builder
//       .addCase(getCategories.pending, state => {
//         state.categoryLoading = 'loading';
//       })
//       .addCase(getCategories.fulfilled, (state, action) => {
//         state.categoryLoading = 'loaded';
//         state.categoryList = action.payload;
//       })
//       .addCase(getCategories.rejected, (state, action) => {
//         state.categoryLoading = 'failed';
//         state.error = action.payload;
//       });

//     // product list
//     builder
//       .addCase(getProductList.pending, (state, action) => {
//         state.productListLoading = 'loading';
//         if (action.meta.arg.page === 1) {
//           state.productList = [];
//         }
//       })
//       .addCase(getProductList.fulfilled, (state, action) => {
//         state.productListLoading = 'loaded';
//         state.productList = state.productList.concat(action.payload.data);
//         state.totalcount = action.payload.total ?? 10;
//       })
//       .addCase(getProductList.rejected, state => {
//         state.productListLoading = 'failed';
//       });

//     // Product Details
//     builder
//       .addCase(getProductDetail.pending, (state, action) => {
//         state.productDetailLoading = 'loading';
//         if (state.productDetail?.id !== action.meta.arg) {
//           state.productDetail = undefined;
//         }
//       })
//       .addCase(getProductDetail.fulfilled, (state, action) => {
//         state.productDetailLoading = 'loaded';
//         state.productDetail = action.payload;
//       })
//       .addCase(getProductDetail.rejected, (state, action) => {
//         state.productDetailLoading = 'failed';
//         state.error = action.error;
//       });

//     // add to cart
//     builder
//       .addCase(addToCart.pending, (state, action) => {
//         const { product_id } = action.meta.arg;
//         // HOME PRODUCTS
//         if (state.homeData?.products) {
//           updateProductById(
//             state.homeData.products,
//             product_id,
//             productFromHome => {
//               productFromHome.loading = false;
//             },
//           );
//         }
//         // PRODUCT LISTING
//         if (state.productList) {
//           updateProductById(
//             state.productList,
//             product_id,
//             productLFromListing => {
//               productLFromListing.loading = false;
//             },
//           );
//         }
//         // PRODUCT DETAIL
//         if (state.productDetail?.id === product_id) {
//           state.productDetail.loading = false;
//         }
//         // CART LISTING
//         if (state.cart) {
//           updateProductById(state.cart, product_id, cartList => {
//             cartList.loading = false;
//           });
//         }
//         // WISHLISTED PRODUCTS
//         if (state.wishlist) {
//           updateProductById(state.wishlist, product_id, wishlisted => {
//             wishlisted.loading = false;
//           });
//         }
//         state.addToCartLoading = 'loading';
//       })
//       .addCase(addToCart.fulfilled, (state, action) => {
//         const { product_id, quantity } = action.meta.arg;
//         // HOME PRODUCTS
//         if (state.homeData?.products) {
//           updateProductById(
//             state.homeData.products,
//             product_id,
//             productFromHome => {
//               productFromHome.quantity = quantity;
//               productFromHome.loading = false;
//             },
//           );
//         }
//         // PRODUCT LISTING
//         if (state.productList) {
//           updateProductById(state.productList, product_id, productList => {
//             productList.quantity = quantity;
//             productList.loading = false;
//           });
//         }
//         // PRODUCT DETAIL
//         if (state.productDetail?.id === product_id) {
//           state.productDetail.quantity = quantity;
//           state.productDetail.loading = false;
//         }
//         // CART LISTING
//         if (state.cart) {
//           updateProductById(state.cart, product_id, cartItem => {
//             if (quantity === 0) {
//               state.cart = state.cart.filter(item => item.id !== cartItem.id);
//               return;
//             }
//             cartItem.quantity = quantity;
//             cartItem.loading = false;
//           });
//         }
//         // WISHLISTED PRODUCTS
//         if (state.wishlist) {
//           state.wishlist = state.wishlist.filter(
//             item => item.id !== product_id,
//           );
//         }

//         state.addToCartLoading = 'loaded';
//       })
//       .addCase(addToCart.rejected, (state, action) => {
//         const { product_id } = action.meta.arg;
//         // HOME PRODUCTS
//         if (state.homeData?.products) {
//           updateProductById(
//             state.homeData.products,
//             product_id,
//             productFromHome => {
//               productFromHome.loading = false;
//             },
//           );
//         }
//         // PRODUCT LISTING
//         if (state.productList) {
//           updateProductById(
//             state.productList,
//             product_id,
//             productLFromListing => {
//               productLFromListing.loading = false;
//             },
//           );
//         }
//         // PRODUCT DETAIL
//         if (state.productDetail?.id === product_id) {
//           state.productDetail.loading = false;
//         }
//         // CART LISTING
//         if (state.cart) {
//           updateProductById(state.cart, product_id, cartList => {
//             cartList.loading = false;
//           });
//         }
//         // WISHLISTED PRODUCTS
//         if (state.wishlist) {
//           updateProductById(state.wishlist, product_id, wishlisted => {
//             wishlisted.loading = false;
//           });
//         }

//         state.addToCartLoading = 'failed';
//         state.error = action.error;
//       });

//     // Cart Details
//     builder
//       .addCase(getCartDetail.pending, state => {
//         state.cartLoading = 'loading';
//       })
//       .addCase(getCartDetail.fulfilled, (state, action) => {
//         state.cartLoading = 'loaded';
//         state.cart = action.payload;
//       })
//       .addCase(getCartDetail.rejected, (state, action) => {
//         state.cartLoading = 'failed';
//         state.error = action.error;
//       });

//     // add to wishlist
//     builder
//       .addCase(addToWishlist.pending, state => {
//         state.wishlistLoading = 'loading';
//       })
//       .addCase(addToWishlist.fulfilled, (state, action) => {
//         const { product_id } = action.meta.arg;
//         // HOME PRODUCTS
//         if (state.homeData?.products) {
//           updateProductById(state.homeData.products, product_id, product => {
//             product.liked = true;
//             product.loading = false;
//           });
//         }
//         // PRODUCT LISTING
//         if (state.productList) {
//           updateProductById(state.productList, product_id, product => {
//             product.liked = true;
//             product.loading = false;
//           });
//         }
//         // PRODUCT DETAIL
//         if (state.productDetail?.id === product_id) {
//           state.productDetail.liked = true;
//           state.productDetail.loading = false;
//         }

//         //CART LISTING
//         if (state.cart) {
//           updateProductById(state.cart, product_id, cartList => {
//             cartList.liked = true;
//             cartList.loading = false;
//           });
//         }
//         state.wishlistLoading = 'loaded';
//       })
//       .addCase(addToWishlist.rejected, (state, action) => {
//         state.wishlistLoading = 'failed';
//         state.error = action.error;
//       });

//     // remove to wishlist
//     builder
//       .addCase(removeToWishlist.pending, state => {
//         state.wishlistLoading = 'loading';
//       })
//       .addCase(removeToWishlist.fulfilled, (state, action) => {
//         const { product_id } = action.meta.arg;
//         // HOME PRODUCTS
//         if (state.homeData?.products) {
//           updateProductById(state.homeData.products, product_id, product => {
//             product.liked = false;
//             product.loading = false;
//           });
//         }
//         // PRODUCT LISTING
//         if (state.productList) {
//           updateProductById(state.productList, product_id, product => {
//             product.liked = false;
//             product.loading = false;
//           });
//         }

//         // PRODUCT DETAIL
//         if (state.productDetail?.id === product_id) {
//           state.productDetail.liked = false;
//           state.productDetail.loading = false;
//         }
//         // WISHLIST LISTING
//         if (state.wishlist) {
//           state.wishlist = state.wishlist.filter(
//             item => item.id !== product_id,
//           );
//         }
//         //CART LISTING
//         if (state.cart) {
//           updateProductById(state.cart, product_id, cartList => {
//             cartList.liked = false;
//             cartList.loading = false;
//           });
//         }
//         state.wishlistLoading = 'loaded';
//       })
//       .addCase(removeToWishlist.rejected, (state, action) => {
//         state.wishlistLoading = 'failed';
//         state.error = action.error;
//       });

//     // My wishlist
//     builder
//       .addCase(myWishlist.pending, state => {
//         state.wishlistLoading = 'loading';
//       })
//       .addCase(myWishlist.fulfilled, (state, action) => {
//         state.wishlistLoading = 'loaded';
//         state.wishlist = action.payload;
//       })
//       .addCase(myWishlist.rejected, (state, action) => {
//         state.wishlistLoading = 'failed';
//         state.error = action.error;
//       });

//     // Booked Gold Detail
//     builder
//       .addCase(getBookedGoldDetail.pending, state => {
//         state.bookedGoldDetailLoading = 'loading';
//       })
//       .addCase(getBookedGoldDetail.fulfilled, (state, action) => {
//         state.bookedGoldDetailLoading = 'loaded';
//         state.bookedGoldDetail = action.payload;
//       })
//       .addCase(getBookedGoldDetail.rejected, (state, action) => {
//         state.bookedGoldDetailLoading = 'failed';
//         state.error = action.error;
//       });

//     // Book Gold
//     builder
//       .addCase(bookGold.pending, state => {
//         state.bookGoldLoading = 'loading';
//       })
//       .addCase(bookGold.fulfilled, state => {
//         state.bookGoldLoading = 'loaded';
//       })
//       .addCase(bookGold.rejected, (state, action) => {
//         state.bookGoldLoading = 'failed';
//         state.error = action.error;
//       });

//     // transaction list
//     builder
//       .addCase(getTransactions.pending, (state, action) => {
//         state.transactionsLoading = 'loading';
//         if (action.meta.arg.page === 1) {
//           state.transactions = [];
//         }
//       })
//       .addCase(getTransactions.fulfilled, (state, action) => {
//         state.transactionsLoading = 'loaded';
//         const { page, type } = action.meta.arg;
//         state.transactions = state.transactions.concat(
//           action.payload.data.list,
//         );
//         if (page === 1) {
//           state.totalTransactionAmount =
//             action.payload.data.total_invested ??
//             action.payload.data.total_gold ??
//             0;

//           if (type === 'gold') {
//             state.goldSpentAmount = action.payload.data.gold_value_in_inr ?? 0;
//           }
//         }
//         state.transactionsTotal = action.payload.pagination.total ?? 10;
//       })
//       .addCase(getTransactions.rejected, (state, action) => {
//         state.transactionsLoading = 'failed';
//         state.error = action.error;
//       });

//     // Sip TC
//     builder
//       .addCase(sipTC.pending, state => {
//         state.sipTCLoading = 'loading';
//       })
//       .addCase(sipTC.fulfilled, state => {
//         state.sipTCLoading = 'loaded';
//       })
//       .addCase(sipTC.rejected, (state, action) => {
//         state.sipTCLoading = 'failed';
//         state.error = action.error;
//       });

//     // Sip TC Accept
//     builder
//       .addCase(sipTCAccept.pending, state => {
//         state.sipTCLoading = 'loading';
//       })
//       .addCase(sipTCAccept.fulfilled, state => {
//         state.sipTCLoading = 'loaded';
//       })
//       .addCase(sipTCAccept.rejected, (state, action) => {
//         state.sipTCLoading = 'failed';
//         state.error = action.error;
//       });

//     // My Sip Detail
//     builder
//       .addCase(createSipPayment.pending, state => {
//         state.createSipPaymentLoading = 'loading';
//       })
//       .addCase(createSipPayment.fulfilled, state => {
//         state.createSipPaymentLoading = 'loaded';
//       })
//       .addCase(createSipPayment.rejected, (state, action) => {
//         state.createSipPaymentLoading = 'failed';
//         state.error = action.error;
//       });

//     // My Wallet
//     builder
//       .addCase(myWallet.pending, state => {
//         state.myWalletLoading = 'loading';
//       })
//       .addCase(myWallet.fulfilled, (state, action) => {
//         state.myWalletLoading = 'loaded';
//         state.myWalletData = action.payload;
//       })
//       .addCase(myWallet.rejected, (state, action) => {
//         state.myWalletLoading = 'failed';
//         state.error = action.error;
//       });

//     // WithDraw Sip Amount
//     builder
//       .addCase(withDrawSipAmount.pending, state => {
//         state.withDrawSipAmountLoading = 'loading';
//       })
//       .addCase(withDrawSipAmount.fulfilled, state => {
//         state.withDrawSipAmountLoading = 'loaded';
//       })
//       .addCase(withDrawSipAmount.rejected, (state, action) => {
//         state.withDrawSipAmountLoading = 'failed';
//         state.error = action.error;
//       });

//     // Buy Gold With Sip Amount
//     builder
//       .addCase(buyGoldWithSip.pending, state => {
//         state.buyGoldWithSipLoading = 'loading';
//       })
//       .addCase(buyGoldWithSip.fulfilled, state => {
//         state.buyGoldWithSipLoading = 'loaded';
//       })
//       .addCase(buyGoldWithSip.rejected, (state, action) => {
//         state.buyGoldWithSipLoading = 'failed';
//         state.error = action.error;
//       });

//     // Sell gold
//     builder
//       .addCase(sellGold.pending, state => {
//         state.sellGoldLoading = 'loading';
//       })
//       .addCase(sellGold.fulfilled, state => {
//         state.sellGoldLoading = 'loaded';
//       })
//       .addCase(sellGold.rejected, (state, action) => {
//         state.sellGoldLoading = 'failed';
//         state.error = action.error;
//       });

//     // Get user withdrawals
//     builder
//       .addCase(getWithdrawalList.pending, state => {
//         state.userWithdrawalLoading = 'loading';
//       })
//       .addCase(getWithdrawalList.fulfilled, (state, action) => {
//         state.userWithdrawalLoading = 'loaded';
//         if (action.meta.arg.page === 1) {
//           state.userWithdrawal = action.payload.data;
//         } else {
//           state.userWithdrawal = state.userWithdrawal.concat(
//             action.payload.data,
//           );
//         }
//         state.totalWithDrawals = action.payload.totalcount ?? 0;
//       })
//       .addCase(getWithdrawalList.rejected, (state, action) => {
//         state.userWithdrawalLoading = 'failed';
//         state.error = action.error;
//       });
//   },
// });

// export const homeReducer = homeSlice.reducer;
// export const homeActions = homeSlice.actions;
