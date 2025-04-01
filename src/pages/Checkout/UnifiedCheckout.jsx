import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { clearCart } from '../../redux/cartSlice';
import countriesStatesData from '../../countriesStates.json';
import { ShoppingBag, Truck, CreditCard, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

// Import card logos
import VisaLogo from '../../assets/visa.png';
import MasterCardLogo from '../../assets/mastercard.png';
import RuPayLogo from '../../assets/rupay.png';
import AMEXLogo from '../../assets/amex.png';
import taxmedaddyImg from '../../assets/taxmedaddy.png';

/**
 * Unified checkout component that combines summary, shipping and payment
 * into a single page with a multi-step form
 */
function UnifiedCheckout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [user, loadingAuth] = useAuthState(auth);
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Products data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Shipping address
  const [address, setAddress] = useState({
    houseNo: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    pin: ''
  });
  
  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [card, setCard] = useState({ number: '', cvv: '', expiry: '', type: 'RuPay' });
  const [upi, setUpi] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Fetch products for cart
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  // Fetch user's address
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Set address if available
            if (userData.address) {
              setAddress(userData.address);
            }
            
            // Set payment methods if available
            const savedMethods = userData.paymentMethods || [];
            const cardMethod = savedMethods.find(method => method.cardNumber);
            const upiMethod = savedMethods.find(method => method.upi);

            if (cardMethod) {
              setCard({
                number: cardMethod.cardNumber,
                cvv: cardMethod.cvv,
                expiry: cardMethod.expiry,
                type: cardMethod.type || 'RuPay',
              });
              setPaymentMethod('Card');
            } else if (upiMethod) {
              setUpi(upiMethod.upi);
              setPaymentMethod('UPI');
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  // Cart details with product info
  const cartDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);
  
  // Calculate total
  const subtotal = cartDetails.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 1000 ? 0 : 120; // Free shipping over ₹1000
  const total = subtotal + tax + shipping;
  
  /**
   * Format price with Indian currency format
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };
  
  /**
   * Format card number with spaces
   */
  const formatCardNumber = (value) => {
    return value.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };
  
  /**
   * Detect card type based on number
   */
  const detectCardType = (number) => {
    const trimmedNumber = number.replace(/\s+/g, '');
    if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(trimmedNumber)) return 'Visa';
    if (/^5[1-5][0-9]{14}$/.test(trimmedNumber)) return 'MasterCard';
    if (/^6[0-9]{15}$/.test(trimmedNumber)) return 'RuPay';
    if (/^3[47][0-9]{13}$/.test(trimmedNumber)) return 'AMEX';
    return 'Unknown';
  };
  
  /**
   * Handle card number change and detect card type
   */
  const handleCardNumberChange = (e) => {
    const formattedNumber = formatCardNumber(e.target.value);
    const detectedType = detectCardType(formattedNumber);
    setCard({ ...card, number: formattedNumber, type: detectedType });
  };
  
  /**
   * Handle country change and reset state
   */
  const handleCountryChange = (e) => {
    setAddress(prev => ({ ...prev, country: e.target.value, state: '' }));
  };
  
  /**
   * Handle state change
   */
  const handleStateChange = (e) => {
    setAddress(prev => ({ ...prev, state: e.target.value }));
  };
  
  /**
   * Save shipping address to Firestore
   */
  const saveShippingAddress = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { address });
        return true;
      } catch (error) {
        console.error("Error updating address:", error);
        return false;
      }
    }
    return false;
  };
  
  /**
   * Save payment method to Firestore
   */
  const savePaymentMethod = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userRef);
        
        if (!userDocSnapshot.exists()) {
          throw new Error("User document does not exist.");
        }
        
        const userDoc = userDocSnapshot.data();
        const existingPaymentMethods = Array.isArray(userDoc.paymentMethods) ? userDoc.paymentMethods : [];
        let paymentData = [...existingPaymentMethods];
        
        if (paymentMethod === 'Card') {
          const cardNumber = card.number.replace(/\s+/g, '');
          const cvv = card.cvv.trim();
          const expiry = card.expiry.trim();
          const cardType = card.type;
          
          if (!paymentData.some(method => method.cardNumber === cardNumber)) {
            paymentData.push({ cardNumber, cvv, expiry, type: cardType });
          }
        } else {
          const trimmedUpi = upi.trim();
          if (!paymentData.some(method => method.upi === trimmedUpi)) {
            paymentData.push({ upi: trimmedUpi });
          }
        }
        
        await updateDoc(userRef, { paymentMethods: paymentData });
        return true;
      } catch (error) {
        console.error("Error saving payment method:", error);
        return false;
      }
    }
    return false;
  };
  
  /**
   * Process the order
   */
  const processOrder = async () => {
    setProcessingPayment(true);
    
    try {
      // Save shipping address
      await saveShippingAddress();
      
      // Save payment method
      await savePaymentMethod();
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Order complete
      setOrderComplete(true);
      
      // Clear cart after successful order
      setTimeout(() => {
        dispatch(clearCart());
        navigate('/');
      }, 3000);
      
      return true;
    } catch (error) {
      console.error("Error processing order:", error);
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };
  
  /**
   * Move to next step in checkout
   */
  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate cart has items
      if (cartDetails.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate shipping info
      if (!address.houseNo || !address.line1 || !address.city || !address.state || !address.pin) {
        alert("Please fill all required shipping fields!");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate payment info
      if (paymentMethod === 'Card') {
        if (!card.number || !card.cvv || !card.expiry) {
          alert("Please fill all card details!");
          return;
        }
        
        const cardNumber = card.number.replace(/\s+/g, '');
        if (!/^\d{12,}$/.test(cardNumber)) {
          alert("Invalid card number. It should have at least 12 digits.");
          return;
        }
        
        if (!/^\d{3,4}$/.test(card.cvv)) {
          alert("Invalid CVV. It should be 3 or 4 digits.");
          return;
        }
        
        if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(card.expiry)) {
          alert("Invalid expiry date. Format should be MM/YY.");
          return;
        }
      } else {
        if (!upi || !upi.includes('@')) {
          alert("Please enter a valid UPI ID!");
          return;
        }
      }
      await processOrder();
    }
  };
  
  /**
   * Go back to previous step
   */
  const prevStep = () => {
    setCurrentStep(currentStep > 1 ? currentStep - 1 : 1);
  };
  
  /**
   * Get card logo based on card type
   */
  const getCardLogo = () => {
    switch (card.type) {
      case 'Visa':
        return <img src={VisaLogo} alt="Visa" className="w-16" />;
      case 'MasterCard':
        return <img src={MasterCardLogo} alt="MasterCard" className="w-16" />;
      case 'RuPay':
        return <img src={RuPayLogo} alt="RuPay" className="w-16" />;
      case 'AMEX':
        return <img src={AMEXLogo} alt="AMEX" className="w-16" />;
      default:
        return null;
    }
  };
  
  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.5 } }
  };
  
  // Exit if user is not logged in
  if (!loadingAuth && !user) {
    navigate('/signin');
    return null;
  }
  
  // Show loading spinner
  if (loading || loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Checkout Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
            
            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center w-full max-w-3xl">
                {/* Step 1: Summary */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'} text-white mb-2`}>
                    <ShoppingBag size={18} />
                  </div>
                  <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Summary</span>
                </div>
                
                {/* Line */}
                <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                
                {/* Step 2: Shipping */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'} text-white mb-2`}>
                    <Truck size={18} />
                  </div>
                  <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Shipping</span>
                </div>
                
                {/* Line */}
                <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                
                {/* Step 3: Payment */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'} text-white mb-2`}>
                    {orderComplete ? <CheckCircle size={18} /> : <CreditCard size={18} />}
                  </div>
                  <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Payment</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Checkout Container */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Left Column - Summary and Form */}
              <div className="lg:col-span-2 p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div 
                      key="summary"
                      variants={slideVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                      
                      {cartDetails.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600">Your cart is empty</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Cart Items */}
                          <div className="space-y-4">
                            {cartDetails.map((item) => (
                              <div key={item.productId} className="flex items-center p-4 border border-gray-100 rounded-lg">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="h-full w-full object-contain object-center"
                                  />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.product.name}</h3>
                                    <p className="ml-4">{formatPrice(item.product.price * item.quantity)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Price Summary */}
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-sm mb-2">
                              <p className="text-gray-600">Subtotal</p>
                              <p className="font-medium">{formatPrice(subtotal)}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                              <p className="text-gray-600 flex items-center">
                                Tax (18% GST)
                                <div className="relative group inline-block ml-1">
                                  <img 
                                    src={taxmedaddyImg} 
                                    alt="GST icon" 
                                    className="w-6 h-6 inline-block object-contain"
                                  />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    hehe
                                  </div>
                                </div>
                              </p>
                              <p className="font-medium">{formatPrice(tax)}</p>
                            </div>
                            <div className="flex justify-between text-sm mb-4">
                              <p className="text-gray-600">Shipping</p>
                              <p className="font-medium">
                                {shipping === 0 ? 'Free' : formatPrice(shipping)}
                              </p>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                              <p>Total</p>
                              <p>{formatPrice(total)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {currentStep === 2 && (
                    <motion.div 
                      key="shipping"
                      variants={slideVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">House/Apartment Number*</label>
                          <input
                            type="text"
                            value={address.houseNo}
                            onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1*</label>
                          <input
                            type="text"
                            value={address.line1}
                            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                          <input
                            type="text"
                            value={address.line2}
                            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code*</label>
                          <input
                            type="text"
                            value={address.pin}
                            onChange={(e) => setAddress({ ...address, pin: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
                          <select
                            value={address.country}
                            onChange={handleCountryChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            {Object.keys(countriesStatesData.countries).map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                          <select
                            value={address.state}
                            onChange={handleStateChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="" disabled>
                              Select State
                            </option>
                            {countriesStatesData.countries[address.country]?.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {currentStep === 3 && (
                    <motion.div 
                      key="payment"
                      variants={slideVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h2>
                      
                      {orderComplete ? (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle size={32} className="text-green-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">Order Completed!</h3>
                          <p className="text-gray-600 mb-4">
                            Your order has been successfully processed.
                          </p>
                          <p className="text-sm text-gray-500">You will be redirected to the homepage shortly...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 mb-4">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('Card')}
                              className={`flex-1 py-3 px-4 border rounded-lg text-center transition ${
                                paymentMethod === 'Card'
                                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                                  : 'border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="flex justify-center items-center">
                                <CreditCard className="mr-2" size={18} />
                                <span>Card</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('UPI')}
                              className={`flex-1 py-3 px-4 border rounded-lg text-center transition ${
                                paymentMethod === 'UPI'
                                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                                  : 'border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="flex justify-center items-center">
                                <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 4V7M12 7V20M12 7L19 4V17M12 7L5 4V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>UPI</span>
                              </div>
                            </button>
                          </div>
                          
                          {paymentMethod === 'Card' ? (
                            <div className="space-y-4">
                              {/* Card logo */}
                              <div className="flex justify-center mb-4">
                                {getCardLogo()}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number*</label>
                                <input
                                  type="text"
                                  value={card.number}
                                  onChange={handleCardNumberChange}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="1234 5678 9012 3456"
                                  maxLength="19"
                                  required
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (MM/YY)*</label>
                                  <input
                                    type="text"
                                    value={card.expiry}
                                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV*</label>
                                  <input
                                    type="text"
                                    value={card.cvv}
                                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="123"
                                    maxLength="4"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                                <select
                                  value={card.type}
                                  onChange={(e) => setCard({ ...card, type: e.target.value })}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="RuPay">RuPay (0% fee)</option>
                                  <option value="Visa">Visa (2% fee)</option>
                                  <option value="MasterCard">MasterCard (2% fee)</option>
                                  <option value="AMEX">AMEX (1% fee)</option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID*</label>
                              <input
                                type="text"
                                value={upi}
                                onChange={(e) => setUpi(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="example@upi"
                                required
                              />
                              <p className="mt-2 text-sm text-gray-500">Enter your UPI ID in the format username@bank</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                  {currentStep > 1 && !orderComplete && (
                    <button
                      onClick={prevStep}
                      className="flex items-center text-gray-600 hover:text-gray-900 transition"
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Back
                    </button>
                  )}
                  
                  {!orderComplete && (
                    <button
                      onClick={nextStep}
                      disabled={processingPayment}
                      className={`ml-auto flex items-center px-6 py-2 rounded-lg font-medium ${
                        processingPayment
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } transition`}
                    >
                      {processingPayment ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : currentStep === 3 ? (
                        "Complete Order"
                      ) : (
                        <>
                          Continue
                          <ChevronRight size={16} className="ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Right Column - Order Summary (visible on desktop) */}
              <div className="hidden lg:block bg-gray-50 p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  {cartDetails.slice(0, 3).map((item) => (
                    <div key={item.productId} className="flex items-start">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-16 w-16 object-contain rounded-md border border-gray-200"
                      />
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {cartDetails.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{cartDetails.length - 3} more items
                    </p>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">{formatPrice(subtotal)}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600 flex items-center">
                      Tax (18% GST)
                      <div className="relative group inline-block ml-1">
                        <img 
                          src={taxmedaddyImg} 
                          alt="GST icon" 
                          className="w-6 h-6 inline-block object-contain"
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          hehe
                        </div>
                      </div>
                    </p>
                    <p className="font-medium">{formatPrice(tax)}</p>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-medium">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <div className="flex justify-between font-bold">
                      <p>Total</p>
                      <p>{formatPrice(total)}</p>
                    </div>
                  </div>
                </div>
                
                {subtotal > 1000 && (
                  <div className="mt-6 bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Free shipping on orders over ₹1,000
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default UnifiedCheckout; 