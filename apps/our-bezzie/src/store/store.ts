import {Middleware, configureStore} from '@reduxjs/toolkit';
import {reducer} from './reducer';
import {errorLogger} from './middleware/logger';
// import {injectStore} from '../utils/Socket';

const middlewares: [Middleware] = [errorLogger];

export const store = configureStore({
  reducer: reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(middlewares),
  devTools: __DEV__,
});

// injectStore(store);

export type AppStore = typeof store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
