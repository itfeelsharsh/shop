import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { clearCart, applyCoupon, removeCoupon, removePurchasedFromCart, updateQuantity, removeFromCart } from '../../redux/cartSlice';
import countriesStatesData from '../../countriesStates.json';
import { ShoppingBag, Truck, CreditCard, CheckCircle, ChevronRight, ChevronLeft, Tag, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import OrderConfirmation from '../../components/OrderConfirmation';
import CouponService from '../../utils/couponService';
import { processNewOrder } from '../../utils/orderService';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Import card logos
import VisaLogo from '../../assets/visa.png';
import MasterCardLogo from '../../assets/mastercard.png';
import RuPayLogo from '../../assets/rupay.png';
import AMEXLogo from '../../assets/amex.png';

const COUNTRY_CODES = {
  "India": "+91",
  "United States": "+1",
  "Canada": "+1",
  "United Kingdom": "+44",
  "France": "+33",
  "Germany": "+49",
  "Italy": "+39",
  "Japan": "+81",
  "Thailand": "+66",
  "Vietnam": "+84",
  "Indonesia": "+62",
  "Philippines": "+63",
  "Spain": "+34",
  "Sri Lanka": "+94",
  "Nepal": "+977",
  "Bhutan": "+975"
};

function UnifiedCheckout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [user, loadingAuth] = useAuthState(auth);
  const cartItems = useSelector(state => state.cart.items);
  const appliedCoupon = useSelector(state => state.cart.coupon);
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

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES["India"]);
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Shipping cost calculation
  const [shippingCost, setShippingCost] = useState(0);
  const [importDuty, setImportDuty] = useState(0);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [card, setCard] = useState({ number: '', cvv: '', expiry: '', type: 'RuPay' });
  const [upi, setUpi] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderComplete] = useState(false);
  const [savePaymentInfo, setSavePaymentInfo] = useState(true);
  const [completedOrder] = useState(null);

  // Coupon validation
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();
  const couponInputRef = useRef(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            price: data.price !== undefined ? parseFloat(data.price) : 0,
            mrp: data.mrp !== undefined ? parseFloat(data.mrp) : null,
            stock: data.stock !== undefined ? parseInt(data.stock, 10) : 0
          };
        });
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

            if (userData.name) setCustomerName(userData.name);

            if (userData.phone) {
              let phone = userData.phone;
              let countryCode = '';

              for (const country in COUNTRY_CODES) {
                const code = COUNTRY_CODES[country];
                if (phone.startsWith(code)) {
                  countryCode = code;
                  phone = phone.substring(code.length);
                  break;
                }
              }

              if (countryCode) setSelectedCountryCode(countryCode);
              setPhoneNumber(phone);
            }

            if (userData.address) setAddress(userData.address);

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

    if (user) fetchUserData();
  }, [user]);

  // Cart details with product info
  const cartDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);

  // Calculate total
  const subtotal = cartDetails.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST

  // Calculate shipping cost
  useEffect(() => {
    const calculateShippingCost = () => {
      let newShippingCost = 0;
      let newImportDuty = 0;

      const qualifiesForFreeShipping = subtotal > 1000;

      if (address.country === 'India') {
        if (shippingMethod === 'express') {
          newShippingCost = 150;
        } else if (!qualifiesForFreeShipping) {
          newShippingCost = 100;
        }
      } else {
        newShippingCost = shippingMethod === 'express' ? 600 : 500;
        if (address.country === 'United States') {
          newImportDuty = subtotal * 0.69;
        }
      }

      setShippingCost(newShippingCost);
      setImportDuty(newImportDuty);
    };

    calculateShippingCost();
  }, [address.country, shippingMethod, subtotal]);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = subtotal + tax + shippingCost - discountAmount;

  const isValidPhoneNumber = (phone) => /^[0-9]{7,12}$/.test(phone);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]{0,12}$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const handleCountryCodeChange = (e) => setSelectedCountryCode(e.target.value);
  const getFullPhoneNumber = () => phoneNumber ? `${selectedCountryCode}${phoneNumber}` : '';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCardNumber = (value) => value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'MasterCard';
    if (/^6/.test(cleanNumber)) return 'RuPay';
    if (/^3[47]/.test(cleanNumber)) return 'AMEX';
    return 'RuPay';
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    const cardType = detectCardType(formattedValue);
    setCard({ ...card, number: formattedValue, type: cardType });
  };

  const saveShippingAddress = async () => {
    if (!user) return false;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        address: address,
        name: customerName,
        phone: getFullPhoneNumber()
      });
      return true;
    } catch (error) {
      console.error("Error saving shipping address:", error);
      toast.error("Failed to save shipping address");
      return false;
    }
  };

  const savePaymentMethod = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const paymentMethods = userData.paymentMethods || [];

          if (paymentMethod === 'Card') {
            const existingCardIndex = paymentMethods.findIndex(m => m.cardNumber);
            const cardData = {
              cardNumber: card.number,
              cvv: card.cvv,
              expiry: card.expiry,
              type: card.type
            };

            if (existingCardIndex >= 0) {
              paymentMethods[existingCardIndex] = cardData;
            } else {
              paymentMethods.push(cardData);
            }
          } else if (paymentMethod === 'UPI') {
            const existingUpiIndex = paymentMethods.findIndex(m => m.upi);
            const upiData = { upi };

            if (existingUpiIndex >= 0) {
              paymentMethods[existingUpiIndex] = upiData;
            } else {
              paymentMethods.push(upiData);
            }
          }

          await updateDoc(userRef, { paymentMethods });
        }
        return true;
      } catch (error) {
        console.error("Error saving payment method:", error);
        return false;
      }
    }
    return true;
  };

  const processPayment = async () => {
    console.log('Processing payment with method:', paymentMethod);
    return { success: true, error: null };
  };

  const processOrder = async () => {
    if (!isShippingComplete || !isPaymentComplete) {
      toast.error("Please complete all required information");
      return;
    }

    try {
      setProcessingPayment(true);

      let removedProductIds = [];
      if (user) {
        try {
          const userOrdersQuery = query(
            collection(db, 'users', user.uid, 'orders'),
            where('status', 'in', ['Delivered', 'Shipped'])
          );
          const userOrdersSnapshot = await getDocs(userOrdersQuery);

          const purchasedProductIds = new Set();
          userOrdersSnapshot.docs.forEach(doc => {
            const orderData = doc.data();
            if (orderData.items) {
              orderData.items.forEach(item => {
                purchasedProductIds.add(item.productId);
              });
            }
          });

          const itemsToRemove = cartDetails.filter(item =>
            purchasedProductIds.has(item.productId)
          ).map(item => item.productId);

          if (itemsToRemove.length > 0) {
            dispatch(removePurchasedFromCart(itemsToRemove));
            removedProductIds = itemsToRemove;
            toast.info(`${itemsToRemove.length} previously purchased item(s) were removed from your cart`);

            if (cartDetails.length === itemsToRemove.length) {
              toast.error("All items in your cart have already been purchased");
              setProcessingPayment(false);
              navigate('/cart');
              return;
            }
          }
        } catch (error) {
          console.error("Error checking purchased items:", error);
        }
      }

      if (savePaymentInfo) await savePaymentMethod();

      const updatedCartDetails = cartDetails.filter(item => !removedProductIds.includes(item.productId));

      // Validate stock
      const stockCheckPromises = updatedCartDetails.map(async (item) => {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          if (productData.stock < item.quantity) {
            return {
              name: productData.name,
              requested: item.quantity,
              available: productData.stock,
              productId: item.productId
            };
          }
        }
        return null;
      });

      const stockResults = await Promise.all(stockCheckPromises);
      const outOfStockItems = stockResults.filter(item => item !== null);

      if (outOfStockItems.length > 0) {
        let message = "Some items are no longer available:";
        outOfStockItems.forEach(item => {
          message += `\n${item.name}: Requested: ${item.requested}, Available: ${item.available}`;

          if (item.available > 0) {
            dispatch(updateQuantity({
              productId: item.productId,
              quantity: item.available
            }));
          } else {
            dispatch(removeFromCart(item.productId));
          }
        });

        throw new Error(message);
      }

      const paymentResult = await processPayment();

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment failed");
      }

      await saveShippingAddress();

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        userName: customerName || user.displayName || '',
        userPhone: getFullPhoneNumber() || '',
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        items: updatedCartDetails.map(item => ({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        shipping: {
          address: address,
          method: shippingMethod === 'express' ? "Express Shipping" : "Standard Shipping",
          cost: shippingCost,
          estimatedDelivery: shippingMethod === 'express' ? "2 days" : "7 days"
        },
        payment: {
          method: paymentMethod,
          details: paymentMethod === 'Card' ? {
            cardType: card.type,
            lastFour: card.number.slice(-4),
          } : {
            upiId: upi.split('@')[0] + '@xxxx'
          }
        },
        subtotal,
        tax,
        importDuty,
        discount: discountAmount,
        totalAmount: total + importDuty,
        status: "Placed",
        statusHistory: [{
          status: "Placed",
          timestamp: new Date().toISOString(),
          note: "Order placed successfully"
        }],
        tracking: {
          code: null,
          carrier: address.country === 'India' ? "IndiaPost" : "DHL",
          url: null
        },
        shippingAddress: {
          name: customerName,
          street: `${address.houseNo}, ${address.line1}${address.line2 ? ', ' + address.line2 : ''}`,
          city: address.city,
          state: address.state,
          zip: address.pin,
          country: address.country
        }
      };

      if (appliedCoupon && appliedCoupon.code) {
        orderData.coupon = {
          code: appliedCoupon.code,
          discountAmount: appliedCoupon.discountAmount,
          discountType: appliedCoupon.discountType,
          discountValue: appliedCoupon.discountValue
        };
      }

      if (appliedCoupon && appliedCoupon.couponId) {
        try {
          await CouponService.recordCouponUsage(appliedCoupon.couponId);
        } catch (couponError) {
          console.warn('Failed to record coupon usage:', couponError);
        }
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: customerName || user.displayName || user.email
      };

      const orderResult = await processNewOrder(orderData, userData);

      if (!orderResult.success) {
        const errorMessage = orderResult.error || orderResult.technicalError || 'Failed to process order';
        throw new Error(errorMessage);
      }

      if (orderResult.emailSent) {
        toast.success('Order confirmed! Check your email for confirmation.');
      } else {
        toast.warning('Order confirmed! Email may be delayed.');
      }

      setTimeout(() => {
        dispatch(clearCart());
        navigate(`/summary?orderId=${orderResult.orderId}&paymentId=${orderResult.paymentId || 'direct'}&emailSent=${orderResult.emailSent || 'false'}`);
        setProcessingPayment(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("There was an error processing your order");
      setProcessingPayment(false);
    }
  };

  const areAllRequiredFieldsFilled = () => {
    if (!customerName.trim() || !phoneNumber.trim() || !isValidPhoneNumber(phoneNumber)) {
      return false;
    }

    if (
      !address.houseNo.trim() ||
      !address.line1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.country.trim() ||
      !address.pin.trim()
    ) {
      return false;
    }

    return true;
  };

  const isShippingComplete = areAllRequiredFieldsFilled();
  const isPaymentComplete = paymentMethod === 'Card'
    ? Boolean(card.number && card.cvv && card.expiry)
    : Boolean(upi);

  const nextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!areAllRequiredFieldsFilled()) {
        toast.error("Please fill all required fields");
        return;
      }

      if (!isValidPhoneNumber(phoneNumber)) {
        toast.error("Please enter a valid phone number");
        return;
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (paymentMethod === 'Card') {
        if (!card.number || !card.cvv || !card.expiry) {
          toast.error("Please fill all card details");
          return;
        }
      } else if (paymentMethod === 'UPI') {
        if (!upi) {
          toast.error("Please enter a valid UPI ID");
          return;
        }
      }

      processOrder();
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep > 1 ? currentStep - 1 : 1);
  };

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

  const handleApplyCoupon = async (e) => {
    e.preventDefault();

    if (!/^[A-Z0-9]+$/.test(couponCode.trim())) {
      setCouponError("Coupon code must contain only uppercase letters and numbers");
      return;
    }

    setCouponError('');

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!user) {
      setCouponError("Please sign in to apply a coupon");
      return;
    }

    if (!executeRecaptcha) {
      setCouponError("reCAPTCHA not available");
      return;
    }

    setValidatingCoupon(true);

    try {
      const recaptchaToken = await executeRecaptcha('apply_coupon');

      if (!recaptchaToken) {
        setCouponError("Could not verify human interaction");
        return;
      }

      const result = await CouponService.validateCoupon(
        couponCode,
        cartDetails,
        subtotal,
        user.uid,
        recaptchaToken
      );

      if (result.valid) {
        dispatch(applyCoupon({
          code: result.coupon.code,
          discountAmount: result.discountAmount,
          couponId: result.coupon.id,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
          isProductSpecific: result.isProductSpecific,
          applicableProducts: result.isProductSpecific ? result.eligibleProductIds : [],
          appliedToCartItems: result.isProductSpecific ? result.appliedToCartItems : []
        }));

        setCouponCode('');
        toast.success(result.message);
      } else {
        setCouponError(result.message);
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("An error occurred");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.info("Coupon removed");
  };

  const handleCouponInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    const filteredValue = value.replace(/[^A-Z0-9]/g, '');
    setCouponCode(filteredValue);
  };

  // Exit if user is not logged in
  if (!loadingAuth && !user) {
    navigate('/signin');
    return null;
  }

  // Show loading spinner
  if (loading || loadingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Loader2 className="w-12 h-12 text-gray-900 animate-spin mb-4" />
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  // If order is complete, show confirmation
  if (orderComplete && completedOrder) {
    return <OrderConfirmation order={completedOrder} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Checkout Steps */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                currentStep >= 1 ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                <ShoppingBag size={20} />
              </div>
              <span className="text-sm font-semibold">Summary</span>
            </div>

            <div className={`flex-1 h-1 mx-4 transition-all ${currentStep >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>

            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                currentStep >= 2 ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                <Truck size={20} />
              </div>
              <span className="text-sm font-semibold">Shipping</span>
            </div>

            <div className={`flex-1 h-1 mx-4 transition-all ${currentStep >= 3 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>

            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                currentStep >= 3 ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                <CreditCard size={20} />
              </div>
              <span className="text-sm font-semibold">Payment</span>
            </div>
          </div>
        </m.div>

        {/* Main Checkout Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Column - Content */}
            <div className="lg:col-span-2 p-6 md:p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <m.div
                    key="summary"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                    {cartDetails.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cartDetails.map((item) => (
                          <div key={item.productId} className="flex items-center p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex flex-1 flex-col">
                              <div className="flex justify-between text-base font-semibold text-gray-900">
                                <h3>{item.product.name}</h3>
                                <p className="ml-4">{formatPrice(item.product.price * item.quantity)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </m.div>
                )}

                {currentStep === 2 && (
                  <m.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>

                    {/* Customer Details */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex">
                            <select
                              value={selectedCountryCode}
                              onChange={handleCountryCodeChange}
                              className="w-28 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                            >
                              {Object.keys(COUNTRY_CODES).map((country) => (
                                <option key={country} value={COUNTRY_CODES[country]}>
                                  {COUNTRY_CODES[country]}
                                </option>
                              ))}
                            </select>
                            <input
                              id="phoneNumber"
                              type="tel"
                              value={phoneNumber}
                              onChange={handlePhoneChange}
                              className="flex-1 p-3 border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              placeholder="Phone number"
                              maxLength={12}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="addressHouseNo" className="block text-sm font-medium text-gray-700 mb-2">
                            Apartment/House Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="addressHouseNo"
                            type="text"
                            value={address.houseNo}
                            onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="Apartment, house number, or name"
                          />
                        </div>

                        <div>
                          <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 1 <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="addressLine1"
                            type="text"
                            value={address.line1}
                            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="Street address"
                          />
                        </div>

                        <div>
                          <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 2
                          </label>
                          <input
                            id="addressLine2"
                            type="text"
                            value={address.line2}
                            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="Apartment, suite, unit, etc."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="addressCity"
                              type="text"
                              value={address.city}
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              placeholder="City"
                            />
                          </div>

                          <div>
                            <label htmlFor="addressState" className="block text-sm font-medium text-gray-700 mb-2">
                              State/Province <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="addressState"
                              value={address.state}
                              onChange={(e) => setAddress({ ...address, state: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                              <option value="" disabled>Select State</option>
                              {countriesStatesData.countries[address.country]?.map((state) => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="addressCountry" className="block text-sm font-medium text-gray-700 mb-2">
                              Country <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="addressCountry"
                              value={address.country}
                              onChange={(e) => {
                                setAddress({
                                  ...address,
                                  country: e.target.value,
                                  state: ''
                                });
                                setSelectedCountryCode(COUNTRY_CODES[e.target.value] || COUNTRY_CODES["India"]);
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                              {Object.keys(countriesStatesData.countries).map((country) => (
                                <option key={country} value={country}>{country}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="addressPin" className="block text-sm font-medium text-gray-700 mb-2">
                              PIN/ZIP Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="addressPin"
                              type="text"
                              value={address.pin}
                              onChange={(e) => setAddress({ ...address, pin: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              placeholder="PIN/ZIP code"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Method */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h3>

                      {subtotal > 1000 && (
                        <div className="p-3 rounded-lg mb-4 bg-green-50 text-green-800 text-sm">
                          You qualify for free standard shipping!
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                          shippingMethod === 'standard'
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="standard"
                              checked={shippingMethod === 'standard'}
                              onChange={() => setShippingMethod('standard')}
                              className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900"
                            />
                            <div className="ml-3">
                              <span className="block font-semibold text-gray-900">Standard Shipping</span>
                              <span className="block text-sm text-gray-600 mt-1">Delivery within 7 days</span>
                              <span className="block text-sm font-semibold mt-1">
                                {address.country === 'India'
                                  ? (subtotal > 1000 ? 'Free' : '₹100')
                                  : '₹500'}
                              </span>
                            </div>
                          </div>
                        </label>

                        <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                          shippingMethod === 'express'
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="express"
                              checked={shippingMethod === 'express'}
                              onChange={() => setShippingMethod('express')}
                              className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900"
                            />
                            <div className="ml-3">
                              <span className="block font-semibold text-gray-900">Express Shipping</span>
                              <span className="block text-sm text-gray-600 mt-1">Delivery within 2 days</span>
                              <span className="block text-sm font-semibold mt-1">
                                {address.country === 'India' ? '₹150' : '₹600'}
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>

                      {address.country === 'United States' && (
                        <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                          <p className="text-sm font-semibold">Import Duty Notice:</p>
                          <p className="text-sm mt-1">
                            Orders to the US are subject to 69% import duty.
                          </p>
                        </div>
                      )}
                    </div>
                  </m.div>
                )}

                {currentStep === 3 && (
                  <m.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

                    {orderComplete ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                          <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Order Completed!</h3>
                        <p className="text-gray-600">Your order has been successfully processed.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('Card')}
                            className={`flex-1 py-3 px-4 border rounded-lg text-center transition-all font-medium ${
                              paymentMethod === 'Card'
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
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
                            className={`flex-1 py-3 px-4 border rounded-lg text-center transition-all font-medium ${
                              paymentMethod === 'UPI'
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex justify-center items-center">
                              <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 4V7M12 7V20M12 7L19 4V17M12 7L5 4V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>UPI</span>
                            </div>
                          </button>
                        </div>

                        {paymentMethod === 'Card' ? (
                          <div className="space-y-4">
                            <div className="flex justify-center mb-4">
                              {getCardLogo()}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number*</label>
                              <input
                                type="text"
                                value={card.number}
                                onChange={handleCardNumberChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry (MM/YY)*</label>
                                <input
                                  type="text"
                                  value={card.expiry}
                                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  placeholder="MM/YY"
                                  maxLength="5"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">CVV*</label>
                                <input
                                  type="text"
                                  value={card.cvv}
                                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  placeholder="123"
                                  maxLength="4"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={savePaymentInfo}
                                  onChange={() => setSavePaymentInfo(!savePaymentInfo)}
                                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">Save card for future purchases</span>
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID*</label>
                            <input
                              type="text"
                              value={upi}
                              onChange={(e) => setUpi(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              placeholder="example@upi"
                            />
                            <p className="mt-2 text-sm text-gray-500">Enter your UPI ID (e.g., username@bank)</p>

                            <div className="mt-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={savePaymentInfo}
                                  onChange={() => setSavePaymentInfo(!savePaymentInfo)}
                                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">Save UPI ID for future purchases</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1 bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

                {/* Coupon Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <Tag size={16} className="mr-2 text-gray-900" />
                    Apply Coupon
                  </h4>

                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="space-y-3">
                      <div>
                        <div className="flex">
                          <input
                            id="couponCode"
                            type="text"
                            ref={couponInputRef}
                            value={couponCode}
                            onChange={handleCouponInputChange}
                            placeholder="COUPON CODE"
                            className="w-full border border-gray-300 rounded-l-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase"
                            style={{ textTransform: 'uppercase' }}
                          />
                          <button
                            type="submit"
                            disabled={validatingCoupon}
                            className={`px-5 rounded-r-lg text-white font-semibold text-sm transition-colors ${
                              validatingCoupon ? 'bg-gray-400' : 'bg-gray-900 hover:bg-gray-800'
                            }`}
                          >
                            {validatingCoupon ? (
                              <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>
                        {couponError && (
                          <m.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-2"
                          >
                            {couponError}
                          </m.p>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{appliedCoupon.code}</p>
                          <p className="text-sm text-green-700">
                            {appliedCoupon.discountType === 'percentage'
                              ? `${appliedCoupon.discountValue}% off`
                              : `₹${appliedCoupon.discountValue} off`
                            }
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-gray-500 hover:text-red-500 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>

                  {importDuty > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Import Duty</span>
                      <span>{formatPrice(importDuty)}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total + importDuty)}</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-3">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                    >
                      <ChevronLeft size={18} className="mr-1" />
                      Back
                    </button>
                  )}

                  <button
                    onClick={nextStep}
                    disabled={(currentStep === 2 && !areAllRequiredFieldsFilled()) || processingPayment || cartDetails.length === 0}
                    className={`w-full flex items-center justify-center px-4 py-4 rounded-xl text-white transition-all font-bold shadow-lg hover:shadow-xl ${
                      (currentStep === 2 && !areAllRequiredFieldsFilled()) || processingPayment || cartDetails.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : currentStep === 3 ? (
                      <>Place Order</>
                    ) : (
                      <>
                        Continue
                        <ChevronRight size={18} className="ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnifiedCheckoutWithRecaptcha() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LcXXXXXXXXXXXXXXXXXXXXX"}
    >
      <UnifiedCheckout />
    </GoogleReCaptchaProvider>
  );
}

export default UnifiedCheckoutWithRecaptcha;
