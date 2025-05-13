import React, { useState, useEffect } from "react";
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
import "react-toastify/dist/ReactToastify.css";
import PasswordReset from './pages/PasswordReset'; 
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HelmetProvider } from 'react-helmet-async';
import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Main application component with routing and providers setup
 * Includes support for prerendering, social media embeds, and PWA
 * 
 * @returns {JSX.Element} The main application component
 */
function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  
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

  useEffect(() => {
    // Skip loading screen for search engine bots and social media crawlers
    if (isBotOrCrawler()) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email } = user; 
        dispatch(setUser({ uid, email })); 
      } else {
        dispatch(clearUser()); 
      }
      
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    });
    return unsubscribe;
  }, [dispatch]);

  if (loading && !isBotOrCrawler()) return <LoadingScreen message="Welcome to KamiKoto" showTips={true} />;

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
              closeOnClick
              draggable
              pauseOnHover
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
