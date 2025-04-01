// SignUp.jsx
import React, { useState, useRef } from 'react';
import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import ReCAPTCHA from 'react-google-recaptcha'; 
import { motion } from 'framer-motion';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); 
  const recaptchaRef = useRef(); 
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get the redirect path from location state if exists
  const from = location.state?.from?.pathname || "/";

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error("Please verify the CAPTCHA.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name || user.displayName || '',
        profilePic: profilePic || '',
        cart: [],
      });

      dispatch(setUser(user));
      toast.success("Sign up successful!");
      // Redirect to intended destination or home
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error.message || "An error occurred. Please try again.");
      
      setCaptchaVerified(false);
      recaptchaRef.current.reset(); 
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        profilePic: user.photoURL || '',
        cart: [],
      }, { merge: true });

      dispatch(setUser(user));
      toast.success("Sign up successful!");
      // Redirect to intended destination or home
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error with social sign up:", error);
      toast.error(error.message || "An error occurred.");
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 pt-20">
        <form
          onSubmit={handleSignUp}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
        >
          <h2 className="text-3xl font-semibold text-center mb-6">Sign Up</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="Profile Picture URL \\ use GuGL/GHub to skip this"
            value={profilePic}
            onChange={(e) => setProfilePic(e.target.value)}
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-4 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LddLgYrAAAAAHVincfRV9vd1Qy_cyez6HHBmMuv"} 
            onChange={handleCaptchaVerification}
            ref={recaptchaRef} 
            className="mb-4"
          />
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition-all duration-200 ${loading || !captchaVerified ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading || !captchaVerified}
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
          <div className="mt-4">
            <button 
              onClick={() => handleSocialSignUp(new GoogleAuthProvider())}
              className="w-full bg-red-500 text-white py-2 rounded-lg mb-2 hover:bg-red-600 transition duration-200"
            >
              Sign up with Google
            </button>
            <button
              onClick={() => handleSocialSignUp(new GithubAuthProvider())}
              className="w-full bg-gray-800 text-white py-2 rounded-lg mb-2 hover:bg-gray-900 transition duration-200"
            >
              Sign up with Github
            </button>
          </div>
          <p className="mt-4 text-center text-gray-600">
            Already have an account? <a href="/signin" className="text-blue-600 hover:underline">Sign In</a>
          </p>
        </form>
      </div>
    </motion.div>
  );
}

export default SignUp;
