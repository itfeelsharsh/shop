import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import wishlistReducer from './wishlistSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
