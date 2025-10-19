import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { m } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import defaultPfp from "../assets/defaultpfp.png";

function SignIn() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, github: false });
  const [recaptchaChecking, setRecaptchaChecking] = useState(false);
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || "/";

  // Check if this is an email link sign-in on component mount
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');

        if (!emailForSignIn) {
          emailForSignIn = window.prompt('Please provide your email for confirmation');
        }

        if (emailForSignIn) {
          try {
            setLoading(true);
            const result = await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem('emailForSignIn');

            // Create or update user document with default profile picture
            const userRef = doc(db, "users", result.user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
              // New user - set up with default profile picture
              await setDoc(userRef, {
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.email?.split('@')[0] || "",
                profilePic: defaultPfp,
                cart: [],
                createdAt: new Date().toISOString(),
              });
            } else {
              // Existing user - just update last login
              await setDoc(userRef, {
                uid: result.user.uid,
                email: result.user.email,
              }, { merge: true });
            }

            dispatch(setUser({ uid: result.user.uid, email: result.user.email }));
            toast.success("Successfully signed in!");
            navigate(from, { replace: true });
          } catch (error) {
            console.error("Error signing in with email link:", error);
            toast.error(error.message || "Failed to sign in. Please try again.");
            setLoading(false);
          }
        }
      }
    };

    handleEmailLinkSignIn();
  }, [auth, dispatch, navigate, from]);

  const verifyRecaptchaToken = async () => {
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
      const token = await executeRecaptcha('signin');
      console.log("reCAPTCHA token:", token);
      return !!token;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      toast.error("Could not verify you are human. Proceeding anyway.");
      setCaptchaUnavailable(true);
      return true;
    } finally {
      setRecaptchaChecking(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!await verifyRecaptchaToken()) {
      return;
    }

    setLoading(true);

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/signin',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
      toast.success("Check your email for the sign-in link!");
    } catch (error) {
      console.error("Error sending email link:", error);
      toast.error(error.message || "Failed to send sign-in link");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (e, providerType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!await verifyRecaptchaToken()) {
      return;
    }

    setSocialLoading({
      ...socialLoading,
      [providerType]: true
    });

    const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // New user - set default profile picture
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email,
          profilePic: user.photoURL || defaultPfp,
          cart: [],
          createdAt: new Date().toISOString(),
        });
      } else {
        // Update existing user
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email,
          profilePic: user.photoURL || userDoc.data().profilePic || defaultPfp,
        }, { merge: true });
      }

      dispatch(setUser(user));
      toast.success("Sign in successful!");
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error with social sign in:", error);
      toast.error(error.message || "An error occurred.");
    } finally {
      setSocialLoading({
        ...socialLoading,
        [providerType]: false
      });
    }
  };

  useEffect(() => {
    let captchaTimeout;

    if (!executeRecaptcha) {
      console.log("reCAPTCHA not yet available");
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your KamiKoto account</p>
        </div>

        {/* Main Card */}
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          {!emailSent ? (
            <>
              {/* Email Sign In Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 placeholder-gray-400"
                      required
                      disabled={loading || recaptchaChecking}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || recaptchaChecking || !email}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || recaptchaChecking ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Continue with Email
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Sign In */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={(e) => handleSocialSignIn(e, 'google')}
                  disabled={socialLoading.google || recaptchaChecking}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading.google ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {socialLoading.google ? "Processing..." : "Continue with Google"}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSocialSignIn(e, 'github')}
                  disabled={socialLoading.github || recaptchaChecking}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading.github ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {socialLoading.github ? "Processing..." : "Continue with GitHub"}
                </button>
              </div>
            </>
          ) : (
            /* Email Sent Success State */
            <div className="text-center py-8">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </m.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
              <p className="text-gray-600 mb-6">
                We've sent a magic link to <span className="font-medium text-gray-900">{email}</span>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Click the link in the email to sign in. The link will expire in 60 minutes.
                </p>
              </div>
              <button
                onClick={() => setEmailSent(false)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* reCAPTCHA Notice */}
          {captchaUnavailable && (
            <p className="mt-4 text-xs text-center text-gray-500">
              reCAPTCHA verification bypassed due to unavailability.
            </p>
          )}
        </m.div>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
            Sign up
          </Link>
        </p>

        {/* Privacy Notice */}
        <p className="mt-4 text-xs text-center text-gray-500">
          Protected by reCAPTCHA and subject to the KamiKoto{" "}
          <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>
        </p>
      </div>
    </m.div>
  );
}

export default SignIn;
