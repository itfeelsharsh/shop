import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { m } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Mail, ArrowRight } from 'lucide-react';
import Button from "../components/Button";

function PasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaChecking, setRecaptchaChecking] = useState(false);
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);
  
  // Custom reset password state
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  
  const isResetMode = mode === 'resetPassword' && !!oobCode;
  
  const [verifyingCode, setVerifyingCode] = useState(isResetMode);
  const [codeValid, setCodeValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  // reCAPTCHA v3 hook
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  // Verify the reset code on mount if in reset mode
  useEffect(() => {
    if (isResetMode && oobCode) {
      setVerifyingCode(true);
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setUserEmail(email);
          setCodeValid(true);
          setVerifyingCode(false);
          toast.success("Reset link verified! Please enter your new password.");
        })
        .catch((error) => {
          console.error("Error verifying reset code:", error);
          setCodeValid(false);
          setVerifyingCode(false);
          toast.error("This password reset link is invalid or has expired.");
        });
    }
  }, [isResetMode, oobCode]);

  // Verify the recaptcha token is valid
  const verifyRecaptchaToken = async (actionName) => {
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
      const token = await executeRecaptcha(actionName);
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

  // Handles requesting a password reset link
  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!await verifyRecaptchaToken('passwordreset')) {
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
      setEmail('');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handles executing the actual password reset
  const handleConfirmReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (!await verifyRecaptchaToken('confirmreset')) {
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Password reset successful! You can now log in.");
      setResetCompleted(true);
    } catch (error) {
      console.error("Error setting new password:", error);
      toast.error(error.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };
  
  // Check if reCAPTCHA is available
  useEffect(() => {
    let captchaTimeout;
    
    if (!executeRecaptcha) {
      captchaTimeout = setTimeout(() => {
        setCaptchaUnavailable(true);
      }, 5000);
    }
    
    return () => {
      if (captchaTimeout) clearTimeout(captchaTimeout);
    };
  }, [executeRecaptcha]);

  return (
    <div className="min-h-screen relative bg-[#FCFCF9] bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] flex items-center justify-center px-4 py-16 overflow-hidden font-sans">
      
      {/* Premium Architectural Draft Board Details */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-40">
        <div className="absolute inset-8 border border-zinc-200/80 pointer-events-none" />
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

          {verifyingCode ? (
            /* Verifying Link State */
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D32F2F] mx-auto mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verifying reset link...</h3>
              <p className="text-zinc-500 text-sm">Please hold on while we secure your authorization.</p>
            </div>
          ) : resetCompleted ? (
            /* Reset Completed Success State */
            <div className="text-center py-6">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-50 border border-green-100 rounded-full mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </m.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset Successful</h3>
              <p className="text-gray-500 text-sm mb-6">
                Your new password has been set. You can now log into your account securely.
              </p>
              <Button
                onClick={() => navigate('/signin')}
                fullWidth
                className="bg-[#D32F2F] hover:bg-[#C62828] text-white rounded-2xl py-3.5 text-sm font-bold tracking-wider uppercase"
              >
                Go to Sign In
              </Button>
            </div>
          ) : isResetMode && !codeValid ? (
            /* Link Invalid / Expired State */
            <div className="text-center py-6">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-red-50 border border-red-100 rounded-full mb-4"
              >
                <AlertCircle className="w-8 h-8 text-red-600" />
              </m.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Invalid or Expired Link</h3>
              <p className="text-gray-500 text-sm mb-6">
                This password reset link is no longer valid. It may have expired or been used already.
              </p>
              <Button
                onClick={() => navigate('/password-reset')}
                fullWidth
                className="bg-zinc-800 hover:bg-zinc-900 text-white rounded-2xl py-3.5 text-sm font-bold tracking-wider uppercase"
              >
                Request a New Link
              </Button>
            </div>
          ) : isResetMode && codeValid ? (
            /* Perform Password Reset Form */
            <form onSubmit={handleConfirmReset} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">Set New Password</h2>
                {userEmail && (
                  <p className="text-xs font-semibold text-gray-500 uppercase mt-2">
                    Resetting password for: <span className="text-gray-800 font-bold normal-case">{userEmail}</span>
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-11 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] transition-all placeholder-gray-400 text-sm shadow-sm"
                      required
                      disabled={loading || recaptchaChecking}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-11 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] transition-all placeholder-gray-400 text-sm shadow-sm"
                      required
                      disabled={loading || recaptchaChecking}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading || recaptchaChecking}
                loadingText="Updating password..."
                disabled={!newPassword || !confirmPassword}
                fullWidth
                className="bg-[#D32F2F] hover:bg-[#C62828] text-white rounded-2xl py-3.5 text-sm font-bold tracking-wider uppercase"
              >
                Reset Password
              </Button>
            </form>
          ) : (
            /* Request Password Reset Link Form */
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase font-sans">Forgot Password?</h2>
                <p className="text-center text-gray-500 text-sm mt-2 font-sans">
                  Enter your email address, and we'll send you a secure link to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none font-sans">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] transition-all placeholder-gray-400 text-sm shadow-sm font-sans"
                    required
                    disabled={loading || recaptchaChecking}
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading || recaptchaChecking}
                loadingText="Sending link..."
                disabled={!email}
                fullWidth
                className="bg-[#D32F2F] hover:bg-[#C62828] text-white rounded-2xl py-3.5 text-sm font-bold tracking-wider uppercase font-sans"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Send Reset Link
              </Button>

              <p className="mt-4 text-center text-gray-500 text-sm font-sans">
                Remember your password?{" "}
                <a href="/signin" className="font-bold text-[#D32F2F] hover:underline transition-all">
                  Sign In
                </a>
              </p>
            </form>
          )}
        </m.div>
      </div>
    </div>
  );
}

export default PasswordReset;
