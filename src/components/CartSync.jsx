import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setCart } from '../redux/cartSlice';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * CartSync Component
 * 
 * Handles bidirectional synchronization between Redux cart state and Firestore.
 * 1. When a user logs in, it fetches their saved cart from Firestore.
 * 2. When the Redux cart state changes, it updates the user's cart in Firestore.
 * 
 * This ensures the cart is persisted across devices and sessions for logged-in users.
 */
const CartSync = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const isInitialLoad = useRef(true);
  const prevCartRef = useRef(cartItems);

  // Handle Initial Load from Firestore on Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const cartDoc = await getDoc(doc(db, 'users', user.uid));
          if (cartDoc.exists()) {
            const data = cartDoc.data();
            if (data.cart && Array.isArray(data.cart)) {
              console.log('🛒 CartSync: Loaded cart from Firestore:', data.cart);
              dispatch(setCart(data.cart));
              prevCartRef.current = data.cart;
            }
          }
        } catch (error) {
          console.error('🛒 CartSync: Error fetching cart:', error);
        }
      }
      isInitialLoad.current = false;
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Handle Saving to Firestore on Change
  useEffect(() => {
    const saveCartToFirestore = async () => {
      const user = auth.currentUser;
      
      // Don't sync if the user is not logged in
      if (!user) return;

      // Special case: if cart was cleared, we always want to save that
      // but only if we've already done the initial load from Firestore
      // to avoid accidentally clearing a cart during startup
      if (isInitialLoad.current) return;

      // Check if cart actually changed to avoid redundant writes
      if (JSON.stringify(prevCartRef.current) === JSON.stringify(cartItems)) return;

      try {
        console.log(`🛒 CartSync: Saving cart to Firestore (${cartItems.length} items)...`);
        const userRef = doc(db, 'users', user.uid);
        
        // Use setDoc with merge to only update the cart field
        await setDoc(userRef, { cart: cartItems }, { merge: true });
        prevCartRef.current = cartItems;
      } catch (error) {
        console.error('🛒 CartSync: Error saving cart:', error);
      }
    };

    saveCartToFirestore();
  }, [cartItems]);

  return null; // This component doesn't render anything
};

export default CartSync;
