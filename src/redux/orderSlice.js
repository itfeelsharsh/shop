import { createSlice } from '@reduxjs/toolkit';

/**
 * Redux slice for managing orders state
 * Handles actions related to user orders
 */
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.loading = false;
      state.error = null;
    },
    setOrdersLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setOrdersError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const { setOrders, setOrdersLoading, setOrdersError, clearOrders } = orderSlice.actions;

export default orderSlice.reducer; 