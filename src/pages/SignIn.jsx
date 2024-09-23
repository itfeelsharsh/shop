import React, { useState } from "react";
import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import ReCAPTCHA from "react-google-recaptcha"; 

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error("Please verify the CAPTCHA.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      dispatch(setUser(user));
      toast.success("Sign in successful!");
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    if (!captchaVerified) {
      toast.error("Please verify the CAPTCHA.");
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        profilePic: user.photoURL || "",
      }, { merge: true });

      dispatch(setUser(user));
      toast.success("Sign in successful!");
      navigate("/");
    } catch (error) {
      console.error("Error with social sign in:", error);
      toast.error(error.message || "An error occurred.");
    }
  };

  const handleCaptchaVerification = (value) => {
    setCaptchaVerified(!!value);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-semibold text-center mb-6">Sign In</h2>
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
          sitekey="6Lf63EoqAAAAAJLVIpWdZmg-pri-kVm-Lw2a2m5E" 
          onChange={handleCaptchaVerification}
          className="mb-4"
        />
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition-all duration-200 ${
            loading || !captchaVerified ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          disabled={loading || !captchaVerified}
        >
          {loading ? "Processing..." : "Sign In"}
        </button>
        <div className="mt-4">
          <button
            onClick={() => handleSocialSignIn(new GoogleAuthProvider())}
            className={`w-full bg-red-500 text-white py-2 rounded-lg mb-2 ${!captchaVerified ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!captchaVerified}
          >
            Sign in with Google
          </button>
          <button
            onClick={() => handleSocialSignIn(new GithubAuthProvider())}
            className={`w-full bg-gray-800 text-white py-2 rounded-lg mb-2 ${!captchaVerified ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!captchaVerified}
          >
            Sign in with Github
          </button>
          <button
            onClick={() => handleSocialSignIn(new FacebookAuthProvider())}
            className={`w-full bg-blue-700 text-white py-2 rounded-lg ${!captchaVerified ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!captchaVerified}
          >
            Sign in with Facebook
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
        <p className="mt-4 text-center text-gray-600">
          <a href="/password-reset" className="text-blue-600 hover:underline">
            Forgot your password?
          </a>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
