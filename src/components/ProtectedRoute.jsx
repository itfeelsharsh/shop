/**
 * ProtectedRoute component
 * 
 * This component acts as a wrapper for routes that require authentication.
 * If the user is not logged in, they will be redirected to the login page.
 * If they are logged in, the protected component will be rendered.
 */
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { toast } from 'react-toastify';

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();
  
  useEffect(() => {
    // If user is not logged in and we're not loading, show a toast message
    if (!loading && !user) {
      toast.info("Please sign in to access this page", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [user, loading]);

  // While checking auth state, show nothing to avoid flash of content
  if (loading) {
    return null;
  }
  
  // If authenticated, render the protected component
  // Otherwise, redirect to sign in page and preserve the intended destination location
  return user ? children : <Navigate to="/signin" state={{ from: location }} replace />;
}

export default ProtectedRoute; 