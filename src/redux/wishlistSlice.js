import { createSlice } from '@reduxjs/toolkit';

/**
 * Redux slice for managing the user's wishlist
 * Handles adding, removing, and setting wishlist items
 */
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    /**
     * Sets the loading state for wishlist operations
     * @param {Object} state - Current wishlist state
     * @param {Object} action - Action with payload containing loading state
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    /**
     * Sets an error message for wishlist operations
     * @param {Object} state - Current wishlist state
     * @param {Object} action - Action with payload containing error message
     */
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    /**
     * Sets the entire wishlist items array
     * Used when fetching wishlist from Firebase
     * @param {Object} state - Current wishlist state
     * @param {Object} action - Action with payload containing wishlist items array
     */
    setWishlistItems: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * Adds a product to the wishlist
     * @param {Object} state - Current wishlist state
     * @param {Object} action - Action with payload containing product to add
     */
    addToWishlist: (state, action) => {
      // Check if item already exists in wishlist to avoid duplicates
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    
    /**
     * Removes a product from the wishlist
     * @param {Object} state - Current wishlist state
     * @param {Object} action - Action with payload containing product ID to remove
     */
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    /**
     * Clears all items from the wishlist
     * @param {Object} state - Current wishlist state
     */
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setWishlistItems, 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist 
} = wishlistSlice.actions;

export default wishlistSlice.reducer; 