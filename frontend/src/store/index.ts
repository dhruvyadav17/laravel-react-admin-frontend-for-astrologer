// PATH: src/store/index.ts
// FIX F1: RootState aur AppDispatch export missing the → TypeScript build fail
import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './authSlice';
import { baseApi }         from './api';

export const store = configureStore({
  reducer: {
    auth:                  authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(baseApi.middleware),
});

// FIX F1: Export karo — required by useSelector/useDispatch throughout app
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
