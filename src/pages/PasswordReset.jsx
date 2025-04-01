import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha'; 
import { motion } from 'framer-motion';


function PasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); 
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error("Please verify the CAPTCHA.");
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

  const handleCaptchaVerification = (value) => {
    setCaptchaVerified(!!value);
  };

  return (
    <motion.div
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

        <ReCAPTCHA
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LddLgYrAAAAAHVincfRV9vd1Qy_cyez6HHBmMuv"} 
          onChange={handleCaptchaVerification}
          className="mb-4"
        />

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold ${loading || !captchaVerified ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={loading || !captchaVerified}
        >
          {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Remember your password? <a href="/signin" className="text-blue-600 hover:underline">Sign In</a>
        </p>
      </form>
    </div>
    </motion.div>

  );
}

export default PasswordReset;
