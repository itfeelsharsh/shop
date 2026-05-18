import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { m } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import defaultPfp from "../assets/defaultpfp.png";
import Button from "../components/Button";
import { Helmet } from "react-helmet-async";
import { useAuthState } from 'react-firebase-hooks/auth';

function SignUp() {
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
  const [user] = useAuthState(auth);

  // Automatically redirect to /my-account if already logged in
  useEffect(() => {
    if (user && !loading && !socialLoading.google && !socialLoading.github) {
      navigate("/my-account", { replace: true });
    }
  }, [user, loading, socialLoading, navigate]);

  // Check if this is an email link sign-up on component mount
  useEffect(() => {
    const handleEmailLinkSignUp = async () => {
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

            // Create user document with default profile picture
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
            }

            dispatch(setUser({ uid: result.user.uid, email: result.user.email }));
            toast.success("Welcome to KamiKoto! Account created successfully.");
            navigate(from, { replace: true });
          } catch (error) {
            console.error("Error signing up with email link:", error);
            toast.error(error.message || "Failed to sign up. Please try again.");
            setLoading(false);
          }
        }
      }
    };

    handleEmailLinkSignUp();
  }, [dispatch, navigate, from]);

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
      const token = await executeRecaptcha('signup');
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

  const handleEmailSignUp = async (e) => {
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
        url: window.location.origin + '/signup',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
      toast.success("Check your email to complete sign up!");
    } catch (error) {
      console.error("Error sending email link:", error);
      if (error.code === 'auth/quota-exceeded' || error.message?.includes('quota-exceeded')) {
        toast.error(
          "Firebase daily email quota exceeded. Please sign up using Google or GitHub below, which do not consume the daily email quota!",
          { autoClose: 10000 }
        );
      } else {
        toast.error(error.message || "Failed to send sign-up link");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (e, providerType) => {
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
          email: user.email,
          name: user.displayName || '',
          profilePic: user.photoURL || defaultPfp,
          cart: [],
          createdAt: new Date().toISOString(),
        });
        toast.success("Welcome to KamiKoto!");
      } else {
        // Existing user
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || userDoc.data().name,
          profilePic: user.photoURL || userDoc.data().profilePic || defaultPfp,
        }, { merge: true });
        toast.success("Welcome back!");
      }

      dispatch(setUser(user));
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error with social sign up:", error);
      if (error.code === 'auth/popup-blocked') {
        toast.error("Sign-up popup was blocked by your browser. Please allow popups for this site or try again.");
      } else {
        toast.error(error.message || "An error occurred.");
      }
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
    <div className="min-h-screen relative bg-[#FCFCF9] bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] flex items-center justify-center px-4 py-16 overflow-hidden font-sans">
      <Helmet>
        <title>Create Account | KamiKoto</title>
        <meta name="description" content="Join KamiKoto today and start your journey with premium stationery." />
      </Helmet>

      {/* Premium Architectural Draft Board Details */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-40">
        {/* Technical Border Lines */}
        <div className="absolute inset-8 border border-zinc-200/80 pointer-events-none" />
        {/* Architectural Crop Marks [+] in 4 corners */}
        <div className="absolute top-6 left-6 text-zinc-400 font-mono text-[10px]">[+] 34.0522° N, 118.2437° W</div>
        <div className="absolute top-6 right-6 text-zinc-400 font-mono text-[10px]">[+] SYS_INIT_0x0B</div>
        <div className="absolute bottom-6 left-6 text-zinc-400 font-mono text-[10px]">[+] KAMI_KOTO_STUDIO</div>
        <div className="absolute bottom-6 right-6 text-zinc-400 font-mono text-[10px]">[+] SCALE_1:1_DRAFT</div>

        {/* Soft glowing ambient light points */}
        <m.div
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-red-100/30 blur-[100px]"
        />
        <m.div
          animate={{
            x: [0, -20, 30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-amber-100/25 blur-[120px]"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header with Brand Logo */}
        <div className="text-center mb-6">
          <m.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mb-4 inline-block relative"
          >
     
          </m.div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">Create Your KamiKoto Account</h1>
    
        </div>

        {/* Frosted Glass Main Card */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-zinc-200/30 border border-zinc-200/60 p-6 sm:p-10"
        >
          {/* Architectural [+] detail markers inside card corners */}
          <div className="absolute top-4 left-4 text-zinc-300 font-mono text-[9px] select-none">[+]</div>
          <div className="absolute top-4 right-4 text-zinc-300 font-mono text-[9px] select-none">[+]</div>
          <div className="absolute bottom-4 left-4 text-zinc-300 font-mono text-[9px] select-none">[+]</div>
          <div className="absolute bottom-4 right-4 text-zinc-300 font-mono text-[9px] select-none">[+]</div>

          {!emailSent ? (
            <>
              {/* Email Sign Up Form */}
              <form onSubmit={handleEmailSignUp} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] transition-all duration-300 placeholder-gray-400 text-sm shadow-sm"
                      required
                      disabled={loading || recaptchaChecking}
                    />
                  </div>
                  <p className="mt-2.5 text-[10px] text-zinc-400 font-medium leading-normal tracking-wide uppercase">
                    We will send a highly secure verification link to complete your signup.
                  </p>
                </div>

                <Button
                  type="submit"
                  isLoading={loading || recaptchaChecking}
                  loadingText="Sending link..."
                  disabled={!email}
                  fullWidth
                  className="btn-shopify bg-[#D32F2F] hover:bg-[#C62828] text-white rounded-2xl py-3.5 text-sm font-bold tracking-wider uppercase btn-shiny-ribbon"
                  icon={<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                >
                  Create Account
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="px-4 bg-white/0 text-gray-400 font-semibold">Or sign up with</span>
                </div>
              </div>

              {/* Social Sign Up Options */}
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={(e) => handleSocialSignUp(e, 'google')}
                  isLoading={socialLoading.google}
                  loadingText="Connecting..."
                  disabled={recaptchaChecking}
                  className="btn-shopify bg-white border border-zinc-200 hover:bg-gray-50 rounded-2xl py-3 text-sm text-gray-700 font-medium"
                  icon={
                    <svg className="w-4 h-4 mr-2 inline" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  }
                >
                  Continue with Google
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={(e) => handleSocialSignUp(e, 'github')}
                  isLoading={socialLoading.github}
                  loadingText="Connecting..."
                  disabled={recaptchaChecking}
                  className="btn-shopify bg-white border border-zinc-200 hover:bg-gray-50 rounded-2xl py-3 text-sm text-gray-700 font-medium"
                  icon={
                    <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                  }
                >
                  Continue with GitHub
                </Button>
              </div>

              {/* Terms & Privacy Notice */}
              <p className="mt-6 text-[10px] text-center text-zinc-400 font-semibold tracking-wider leading-relaxed uppercase">
                By creating an account, you agree to our{" "}
                <a href="/terms-of-service" className="underline text-gray-700 hover:text-[#D32F2F] transition-colors">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy-policy" className="underline text-gray-700 hover:text-[#D32F2F] transition-colors">Privacy Policy</a>.
              </p>
            </>
          ) : (
            /* Email Sent Success State */
            <div className="text-center py-6">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-red-50/80 border border-red-100 rounded-full mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-[#D32F2F]" />
              </m.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-gray-500 text-sm mb-6">
                We have sent a verification link to <span className="font-semibold text-gray-900">{email}</span>
              </p>
              <div className="bg-red-50/30 border border-red-100/40 rounded-2xl p-4 mb-6">
                <p className="text-xs text-red-950 leading-relaxed font-semibold">
                  Click the link inside the email to complete your registration.
                </p>
                <p className="text-[10px] text-red-700 leading-normal mt-1 uppercase font-semibold tracking-wider">
                  The link will expire in 60 minutes.
                </p>
              </div>
              <button
                onClick={() => setEmailSent(false)}
                className="text-xs text-zinc-400 hover:text-[#D32F2F] transition-colors uppercase tracking-widest font-bold"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* reCAPTCHA Notice */}
          {captchaUnavailable && (
            <p className="mt-4 text-[10px] text-center text-zinc-400 font-semibold tracking-wider uppercase">
              reCAPTCHA verification bypassed due to unavailability.
            </p>
          )}
        </m.div>

        {/* Bottom Toggle Link */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/signin" className="font-bold text-[#D32F2F] hover:text-[#C62828] hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
