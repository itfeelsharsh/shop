import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ProductView from "./pages/ProductView";
import Cart from "./pages/Cart";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import MyAccount from "./pages/Profile";
import UnifiedCheckout from "./pages/Checkout/UnifiedCheckout";
import Products from "./pages/Products";
import Wishlist from "./pages/Wishlist";
import LoadingScreen from "./components/LoadingScreen";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import AnnouncementStrip from "./components/AnnouncementStrip";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import { useContentLoader } from "./hooks/useContentLoader";
import "react-toastify/dist/ReactToastify.css";
import PasswordReset from './pages/PasswordReset'; 
import OrderSummary from './pages/OrderSummary';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HelmetProvider } from 'react-helmet-async';
import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Main application component with routing and providers setup
 * Features comprehensive content loading that waits for all critical assets
 * before displaying the website to ensure optimal user experience
 * 
 * @returns {JSX.Element} The main application component
 */
function App() {
  const dispatch = useDispatch();
  
  // Use the comprehensive content loader hook
  const {
    isLoading,
    loadingProgress,
    loadingStates,
    errors,
    markAuthLoaded,
    forceComplete
  } = useContentLoader();
  
  /**
   * Detects if the current visitor is a social media crawler/bot
   * Used to bypass loading screens for better SEO and link previews
   * 
   * @returns {boolean} True if the current user agent appears to be a bot
   */
  const isBotOrCrawler = () => {
    if (typeof window === 'undefined' || !window.navigator) return false;
    
    const botPatterns = [
      'googlebot', 'bingbot', 'yandex', 'baiduspider', 'twitterbot',
      'facebookexternalhit', 'linkedinbot', 'discordbot', 'slackbot',
      'telegrambot', 'whatsapp', 'line-podcast', 'skype', 'pinterest',
      'bot', 'spider', 'crawl'
    ];
    
    const userAgent = navigator.userAgent.toLowerCase();
    return botPatterns.some(pattern => userAgent.indexOf(pattern) !== -1);
  };

  // Handle authentication state changes
  useEffect(() => {
    // Skip loading screen for search engine bots and social media crawlers
    if (isBotOrCrawler()) {
      markAuthLoaded();
      return;
    }
    
    // Set up authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email } = user; 
        dispatch(setUser({ uid, email })); 
      } else {
        dispatch(clearUser()); 
      }
      
      // Mark authentication as loaded after a brief delay for smooth UX
      setTimeout(() => {
        markAuthLoaded();
      }, 500);
    });
    
    return unsubscribe;
  }, [dispatch, markAuthLoaded]);

  // Emergency loading completion for development/testing
  useEffect(() => {
    // Add keyboard shortcut for emergency loading completion (Ctrl+Shift+L)
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        console.log('🔧 Emergency loading completion triggered');
        forceComplete();
      }
    };
    
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [forceComplete]);

  // Show comprehensive loading screen with progress
  if (isLoading && !isBotOrCrawler()) {
    return (
      <LoadingScreen 
        message="Preparing your shopping experience"
        progress={loadingProgress}
        showTips={true}
        loadingStates={loadingStates}
        errors={errors}
      />
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <HelmetProvider>
        <GoogleReCaptchaProvider
          reCaptchaKey="6LdQtjcrAAAAAB-gw9QaVLt8zIUTcvWAjCmlVwDs"
          scriptProps={{
            async: true, // Async load to improve page load time
            defer: true,
            appendTo: 'head',
          }}
          language="en"
          useRecaptchaNet={true} // Use recaptcha.net instead of google.com (helps in certain countries)
          useEnterprise={false} // Set to true if using enterprise version
          scriptLoadingTimeout={10000} // 10 seconds timeout (adjust as needed)
        >
          <Router>
            <ScrollToTop />
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              limit={3}
              icon={true}
              className="mt-16"
            />

            <div className="flex flex-col min-h-screen">
              <Navbar />
              <AnnouncementStrip />

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductView />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/password-reset" element={<PasswordReset />} />
                  
                  {/* My Account routes */}
                  <Route path="/my-account" element={
                    <ProtectedRoute>
                      <MyAccount />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-account/:section" element={
                    <ProtectedRoute>
                      <MyAccount />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/wishlist" element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={<UnifiedCheckout />} />
                  
                  {/* Post-checkout order summary page - displays order confirmation */}
                  {/* Accessible after successful payment with orderId and paymentId query parameters */}
                  <Route path="/summary" element={<OrderSummary />} />
                  
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </GoogleReCaptchaProvider>
      </HelmetProvider>
    </LazyMotion>
  );
}

export default App;
