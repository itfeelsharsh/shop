import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { m, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Wand2,
  Shield,
  Zap,
} from 'lucide-react';
import brandLogo from '../assets/kamikoto-logo-transparent-darkish-logo-for-better-visibility.png';
import defaultPfp from '../assets/defaultpfp.png';
import CyberCanvas from './CyberCanvas';
import '../styles/cyberAuth.css';

/**
 * CyberAuthExperience:
 * Master futuristic authentication portal combining Stark Industries HUD,
 * Stripe skewed beam grid, C-Rodg sliding dual panel, and fluid morphing rings.
 */
export default function AuthExperience({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'magic'
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  // Status state
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, github: false });
  const [recaptchaChecking, setRecaptchaChecking] = useState(false);
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const rawFrom = location.state?.from?.pathname || location.state?.from || '/';
  const from =
    typeof rawFrom === 'string' &&
    rawFrom.startsWith('/') &&
    !rawFrom.startsWith('//') &&
    !rawFrom.includes('://')
      ? rawFrom
      : '/';

  const [user] = useAuthState(auth);

  // Sync mode with route changes
  useEffect(() => {
    if (location.pathname === '/signup' && mode !== 'signup') {
      setMode('signup');
    } else if (location.pathname === '/signin' && mode !== 'login') {
      setMode('login');
    }
  }, [location.pathname, mode]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading && !socialLoading.google && !socialLoading.github) {
      navigate('/my-account', { replace: true });
    }
  }, [user, loading, socialLoading, navigate]);

  // Switch between Login and Signup modes smoothly
  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setEmailSent(false);
    if (newMode === 'signup') {
      navigate('/signup', { replace: true, state: location.state });
    } else {
      navigate('/signin', { replace: true, state: location.state });
    }
  };

  // ReCAPTCHA v3 verification with fallback
  const verifyRecaptchaToken = async (action) => {
    if (captchaUnavailable) return true;
    if (!executeRecaptcha) {
      setCaptchaUnavailable(true);
      return true;
    }
    setRecaptchaChecking(true);
    try {
      const token = await executeRecaptcha(action);
      return !!token;
    } catch (err) {
      console.warn('reCAPTCHA error:', err);
      setCaptchaUnavailable(true);
      return true;
    } finally {
      setRecaptchaChecking(false);
    }
  };

  // Magic link sign-in detection on page mount
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

            const userRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
              await setDoc(userRef, {
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.email?.split('@')[0] || '',
                profilePic: defaultPfp,
                userRole: 'User',
                cart: [],
                createdAt: new Date().toISOString(),
              });
            } else {
              await setDoc(userRef, {
                uid: result.user.uid,
                email: result.user.email,
              }, { merge: true });
            }

            dispatch(setUser({ uid: result.user.uid, email: result.user.email }));
            toast.success('Successfully authenticated!');
            navigate(from, { replace: true });
          } catch (error) {
            console.error('Error signing in with email link:', error);
            toast.error(error.message || 'Authentication failed. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      }
    };

    handleEmailLinkSignIn();
  }, [dispatch, navigate, from]);

  // Handle Magic Link Submission
  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!await verifyRecaptchaToken(mode === 'login' ? 'magic_signin' : 'magic_signup')) {
      return;
    }

    setLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.origin + (mode === 'signup' ? '/signup' : '/signin'),
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', cleanEmail);
      setEmailSent(true);
      toast.success('Verification link dispatched to your email!');
    } catch (error) {
      console.error('Error sending magic link:', error);
      if (error.code === 'auth/quota-exceeded' || error.message?.includes('quota-exceeded')) {
        toast.error('Daily email quota reached. Please use Google or GitHub sign-in below!');
      } else {
        toast.error(error.message || 'Failed to dispatch verification link');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Direct Password Authentication
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (mode === 'signup' && !agreeTerms) {
      toast.error('Please agree to the Terms of Service & Privacy Policy');
      return;
    }

    if (!await verifyRecaptchaToken(mode === 'login' ? 'password_signin' : 'password_signup')) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const userRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName || result.user.email?.split('@')[0] || '',
            profilePic: result.user.photoURL || defaultPfp,
            userRole: 'User',
            cart: [],
            createdAt: new Date().toISOString(),
          });
        }

        dispatch(setUser({ uid: result.user.uid, email: result.user.email }));
        toast.success('Welcome back to KamiKoto!');
        navigate(from, { replace: true });
      } else {
        // Sign Up
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const cleanName = name.trim() || cleanEmail.split('@')[0];

        if (cleanName) {
          try {
            await updateProfile(result.user, { displayName: cleanName });
          } catch (profileErr) {
            console.warn('Profile name update skipped:', profileErr);
          }
        }

        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: cleanName,
          profilePic: defaultPfp,
          userRole: 'User',
          cart: [],
          createdAt: new Date().toISOString(),
        });

        dispatch(setUser({ uid: result.user.uid, email: result.user.email }));
        toast.success('Account successfully initialized! Welcome to KamiKoto.');
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Password auth error:', error);
      let msg = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password combination. Try Magic Link if you haven’t set a password!';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in or use Magic Link.';
      } else if (error.code === 'auth/operation-not-allowed') {
        msg = 'Password authentication is disabled in Firebase. Please use Magic Link or Social SSO below!';
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Social OAuth (Google / GitHub)
  const handleSocialSignIn = async (e, providerType) => {
    e.preventDefault();
    if (!await verifyRecaptchaToken(`social_${providerType}`)) return;

    setSocialLoading((prev) => ({ ...prev, [providerType]: true }));
    const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const userObj = result.user;

      const userRef = doc(db, 'users', userObj.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userObj.uid,
          name: userObj.displayName || '',
          email: userObj.email,
          profilePic: userObj.photoURL || defaultPfp,
          userRole: 'User',
          cart: [],
          createdAt: new Date().toISOString(),
        });
      } else {
        await setDoc(
          userRef,
          {
            uid: userObj.uid,
            name: userObj.displayName || userDoc.data()?.name || '',
            email: userObj.email,
            profilePic: userObj.photoURL || userDoc.data()?.profilePic || defaultPfp,
          },
          { merge: true }
        );
      }

      dispatch(setUser({ uid: userObj.uid, email: userObj.email }));
      toast.success(`Authenticated with ${providerType === 'google' ? 'Google' : 'GitHub'}!`);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Social sign-in error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Sign-in popup blocked by browser. Please allow popups.');
      } else {
        toast.error(error.message || 'Authentication error occurred.');
      }
    } finally {
      setSocialLoading((prev) => ({ ...prev, [providerType]: false }));
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] text-white selection:bg-red-500 selection:text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center font-sans">
      
      {/* ========================================================
          BACKGROUND LAYER 1: Connor Hubeny Floating Canvas Shapes
          ======================================================== */}
      <CyberCanvas />

      {/* ========================================================
          BACKGROUND LAYER 2: Stripe Skewed Grid & Light Beams
          ======================================================== */}
      <div className="stripe-skewed-bg" aria-hidden="true">
        <div className="stripe-grid-container">
          <div className="stripe-divider" style={{ gridArea: '3 / 2 / auto / 6' }}>
            <div className="stripe-beam stripe-beam-red anim-left-right w-full h-full" />
          </div>
          <div className="stripe-divider" style={{ gridArea: '5 / 1 / auto / 4' }}>
            <div className="stripe-beam stripe-beam-coral anim-slow-lr w-full h-full" />
          </div>
          <div className="stripe-divider" style={{ gridArea: '6 / 3 / auto / 7' }}>
            <div className="stripe-beam stripe-beam-red anim-left-right w-full h-full" />
          </div>
          <div className="stripe-divider" style={{ gridArea: '8 / 4 / auto / 8' }}>
            <div className="stripe-beam stripe-beam-amber anim-slow-rl w-full h-full" />
          </div>
          <div className="stripe-divider" style={{ gridArea: '2 / 13 / auto / 17' }}>
            <div className="stripe-beam stripe-beam-coral anim-right-left w-full h-full" />
          </div>
          <div className="stripe-divider" style={{ gridArea: '4 / 12 / auto / 18' }}>
            <div className="stripe-beam stripe-beam-red anim-slow-lr w-full h-full" />
          </div>
          <div className="stripe-divider" style={{ gridArea: '6 / 13 / auto / 16' }}>
            <div className="stripe-beam stripe-beam-amber anim-right-left w-full h-full" />
          </div>
          <div className="stripe-divider" style={{ gridArea: '8 / 11 / auto / 15' }}>
            <div className="stripe-beam stripe-beam-coral anim-slow-rl w-full h-full" />
          </div>
        </div>
      </div>

      {/* ========================================================
          BACKGROUND LAYER 3: 3D Perspective Hexagon Mesh Floor
          ======================================================== */}
      <div className="cyber-hexagons-container" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r}>
            {Array.from({ length: 14 }).map((_, c) => (
              <span key={c}>&#x2B22; </span>
            ))}
          </div>
        ))}
      </div>

      {/* ========================================================
          MAIN STAGE CONTAINER
          ======================================================== */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto flex flex-col items-center">
        
        {/* Stark Industries Styled KamiKoto Header */}
        <div className="cyber-logo-container mb-2">
          <Link to="/" className="inline-block group focus:outline-none">
            <h1 className="cyber-h1 group-hover:scale-105 transition-transform duration-300">
              <i>KAMIKOTO</i>
            </h1>
          </Link>
        </div>

        {/* Telemetry Status Bar */}
        <div className="flex items-center justify-center gap-3 text-[10px] font-mono tracking-widest uppercase text-red-400/80 mb-4 select-none">
         
        </div>

        {/* Arc Reactor & Fluid Morphing Aura Rings Core */}
        <div className="arc-reactor-wrapper mb-6">
          <div className="arc-reactor-outer" />
          <div className="arc-reactor-middle" />

          {/* 3 Morphing Organic Energy Rings */}
          <div className="morph-aura-ring">
            <i />
            <i />
            <i />
          </div>

          {/* Central Logo Epicenter */}
          <Link
            to="/"
            title="Return to KamiKoto Home"
            className="relative z-10 w-20 h-20 rounded-full bg-[#120c0e]/90 border border-[#ff5252]/40 flex items-center justify-center p-3 shadow-[0_0_25px_rgba(211,47,47,0.5)] backdrop-blur-md group hover:border-[#ff5252] transition-colors"
          >
            <img
              src={brandLogo}
              alt="KamiKoto Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,119,113,0.7)] group-hover:scale-110 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* ========================================================
            SLIDING DUAL-PANEL CONTROLLER & CARD
            ======================================================== */}
        <div className="cyber-card w-full p-6 sm:p-8 relative">
          {/* Cyberpunk corner bracket accents */}
          <div className="cyber-corner cyber-corner-tl" />
          <div className="cyber-corner cyber-corner-tr" />
          <div className="cyber-corner cyber-corner-bl" />
          <div className="cyber-corner cyber-corner-br" />

          {/* Mode Switcher Tabs (Log In vs Sign Up) */}
          <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-black/50 border border-white/10 relative">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-lg ${
                mode === 'login' ? 'text-white shadow-[0_0_15px_rgba(211,47,47,0.5)]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className={`relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-lg ${
                mode === 'signup' ? 'text-white shadow-[0_0_15px_rgba(211,47,47,0.5)]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>

            {/* Sliding Indicator Pill */}
            <m.div
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] border border-[#ff7771]/40 ${
                mode === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            />
          </div>

          {/* Content Switching Area */}
          <AnimatePresence mode="wait">
            {!emailSent ? (
              <m.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -25 : 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 25 : -25 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Method Switcher: Password vs Magic Link */}
                <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                  <div className="text-left">
                    <h2 className="text-lg font-bold tracking-tight text-white">
                      {mode === 'login' ? 'Access Portal' : 'Create Credentials'}
                    </h2>
                    <p className="text-[11px] text-gray-400 font-mono">
                      {mode === 'login'
                        ? 'Login to your KamiKoto account'
                        : 'Sign up for a new KamiKoto account'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('password')}
                      title="Password Authentication"
                      className={`p-1.5 rounded transition-colors ${
                        authMethod === 'password'
                          ? 'bg-[#D32F2F] text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <KeyRound size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('magic')}
                      title="Magic Link (Passwordless)"
                      className={`p-1.5 rounded transition-colors ${
                        authMethod === 'magic'
                          ? 'bg-[#D32F2F] text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Wand2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                <form
                  onSubmit={authMethod === 'password' ? handlePasswordSubmit : handleMagicLinkSubmit}
                  className="space-y-4"
                >
                  {/* Name field (Sign Up only) */}
                  {mode === 'signup' && authMethod === 'password' && (
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                        Display Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <UserIcon size={16} />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          disabled={loading || recaptchaChecking}
                          className="cyber-input w-full pl-10 pr-4 py-2.5 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@kamikoto.com"
                        required
                        disabled={loading || recaptchaChecking}
                        className="cyber-input w-full pl-10 pr-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Password Field (when in password mode) */}
                  {authMethod === 'password' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400">
                          Password
                        </label>
                        {mode === 'login' && (
                          <Link
                            to="/password-reset"
                            className="text-[11px] font-mono text-[#ff7771] hover:text-white transition-colors"
                          >
                            Forgot key?
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          disabled={loading || recaptchaChecking}
                          className="cyber-input w-full pl-10 pr-10 py-2.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Checkboxes */}
                  {mode === 'login' && authMethod === 'password' && (
                    <div className="flex items-center text-xs text-gray-400 pt-1">
                      <label className="flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-gray-700 bg-black/60 text-[#D32F2F] focus:ring-[#D32F2F] h-3.5 w-3.5 mr-2"
                        />
                        Stay authenticated for 7 days
                      </label>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <div className="flex items-start text-[11px] text-gray-400 pt-1">
                      <input
                        id="agree-terms"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="rounded border-gray-700 bg-black/60 text-[#D32F2F] focus:ring-[#D32F2F] h-3.5 w-3.5 mr-2 mt-0.5"
                      />
                      <label htmlFor="agree-terms" className="cursor-pointer select-none leading-relaxed">
                        I accept the{' '}
                        <Link to="/terms-of-service" className="text-[#ff7771] underline hover:text-white">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy-policy" className="text-[#ff7771] underline hover:text-white">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  )}

                  {/* Main Action Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || recaptchaChecking || !email}
                    className="cyber-btn-primary w-full py-3 px-4 mt-2 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    <span>
                      {loading
                        ? 'Processing...'
                        : authMethod === 'magic'
                        ? 'Send Link'
                        : mode === 'login'
                        ? 'Login'
                        : 'Create Account'}
                    </span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="px-3 bg-[#130f11] text-gray-500">OR AUTHENTICATE WITH</span>
                  </div>
                </div>

                {/* Social Sign-In Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleSocialSignIn(e, 'google')}
                    disabled={socialLoading.google || recaptchaChecking}
                    className="cyber-btn-secondary py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>{socialLoading.google ? '...' : 'Google'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSocialSignIn(e, 'github')}
                    disabled={socialLoading.github || recaptchaChecking}
                    className="cyber-btn-secondary py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                    <span>{socialLoading.github ? '...' : 'GitHub'}</span>
                  </button>
                </div>
              </m.div>
            ) : (
              /* Email Sent / Magic Link Success State */
              <m.div
                key="email-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-950/60 border border-red-500/50 shadow-[0_0_20px_rgba(211,47,47,0.4)] mb-4">
                  <CheckCircle2 size={32} className="text-[#ff5252]" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                  TRANSMISSION COMPLETE
                </h3>
                <p className="text-sm text-gray-400 mb-6 font-mono leading-relaxed">
                  Authentication token dispatched to:{' '}
                  <span className="text-white font-semibold underline decoration-red-500 underline-offset-4">
                    {email}
                  </span>
                </p>

                <div className="p-4 rounded-xl bg-black/60 border border-red-500/30 text-xs text-red-200/90 font-mono mb-6 leading-relaxed">
                  Engage the confirmation link in your inbox to initialize session. Link expires in 60 minutes.
                </div>

                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="text-xs font-mono uppercase tracking-widest text-red-400 hover:text-white transition-colors"
                >
                  [ Use alternative address ]
                </button>
              </m.div>
            )}
          </AnimatePresence>

          {/* Bottom Switcher Helper */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
            {mode === 'login' ? (
              <span>
                First time?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  className="text-[#ff5252] hover:text-white font-bold ml-1 transition-colors underline decoration-red-500/40"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already authorized?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-[#ff5252] hover:text-white font-bold ml-1 transition-colors underline decoration-red-500/40"
                >
                  Access portal
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="mt-6 text-center text-[11px] font-mono text-gray-500">

        </div>
      </div>
    </div>
  );
}
