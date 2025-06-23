import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { m } from "framer-motion";


function PasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaChecking, setRecaptchaChecking] = useState(false);
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);
  
  // reCAPTCHA v3 hook
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const navigate = useNavigate();
  
  // Verify the recaptcha token is valid
  const verifyRecaptchaToken = async () => {
    // If we've already determined reCAPTCHA is unavailable, bypass verification
    if (captchaUnavailable) {
      console.warn("reCAPTCHA verification bypassed due to unavailability");
      return true;
    }
    
    if (!executeRecaptcha) {
      console.warn("reCAPTCHA not available, proceeding without verification");
      setCaptchaUnavailable(true);
      return true;
    }

    setRecaptchaChecking(true);
    try {
      // Execute reCAPTCHA with action name
      const token = await executeRecaptcha('passwordreset');
      
      // Here you would normally verify this token on your server
      // For now, we'll just log it and assume it's valid
      console.log("reCAPTCHA token:", token);
      
      // Return true if we got a token
      return !!token;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      toast.error("Could not verify you are human. Proceeding anyway.");
      setCaptchaUnavailable(true);
      return true; // Allow the user to continue despite the error
    } finally {
      setRecaptchaChecking(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    // Verify recaptcha first
    if (!await verifyRecaptchaToken()) {
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
      navigate('/signin'); 
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if reCAPTCHA is available
  useEffect(() => {
    let captchaTimeout;
    
    if (!executeRecaptcha) {
      console.log("reCAPTCHA not yet available");
      // Set a timeout to bypass captcha if it doesn't load in 5 seconds
      captchaTimeout = setTimeout(() => {
        console.warn("reCAPTCHA failed to load after timeout, bypassing verification");
        setCaptchaUnavailable(true);
      }, 5000);
    }
    
    return () => {
      if (captchaTimeout) clearTimeout(captchaTimeout);
    };
  }, [executeRecaptcha]);

  return (
    <m.div
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: "easeInOut" }} 
    className="container mx-auto px-4 py-8 bg-gray-50"
  >
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handlePasswordReset}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-semibold text-center mb-6">Reset Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address, and we'll send you a link to reset your password.
        </p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Protected by reCAPTCHA v3 - No UI needed */}
        <div className="mb-4 text-center text-xs text-gray-500">
          {captchaUnavailable 
            ? "reCAPTCHA verification bypassed due to unavailability." 
            : " "}
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold ${loading || recaptchaChecking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={loading || recaptchaChecking}
        >
          {loading ? 'Sending Reset Email...' : recaptchaChecking ? "Verifying..." : 'Send Reset Email'}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Remember your password? <a href="/signin" className="text-blue-600 hover:underline">Sign In</a>
        </p>
      </form>
    </div>
    </m.div>

  );
}

export default PasswordReset;
