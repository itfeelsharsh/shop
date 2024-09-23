
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
import Profile from "./pages/Profile";
import CheckoutSummary from "./pages/Checkout/Summary";
import CheckoutShipping from "./pages/Checkout/Shipping";
import CheckoutPayment from "./pages/Checkout/Payment";
import Products from "./pages/Products";
import LoadingBar from "./components/LoadingBar";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import "react-toastify/dist/ReactToastify.css";
import PasswordReset from './pages/PasswordReset'; 


function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email } = user; 
        dispatch(setUser({ uid, email })); 
      } else {
        dispatch(clearUser()); 
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [dispatch]);

  if (loading) return <LoadingBar />;

  return (
    <Router>
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

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductView />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/password-reset" element={<PasswordReset />} /> {/* Add this route */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout/summary" element={<CheckoutSummary />} />
            <Route path="/checkout/shipping" element={<CheckoutShipping />} />
            <Route path="/checkout/payment" element={<CheckoutPayment />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
