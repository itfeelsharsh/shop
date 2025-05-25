import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { clearCart, applyCoupon, removeCoupon, removePurchasedFromCart, updateQuantity, removeFromCart } from '../../redux/cartSlice';
import countriesStatesData from '../../countriesStates.json';
import { ShoppingBag, Truck, CreditCard, CheckCircle, ChevronRight, ChevronLeft, Tag, X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderConfirmation from '../../components/OrderConfirmation';
import CouponService from '../../utils/couponService';
import { processNewOrder } from '../../utils/orderService';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Import card logos
import VisaLogo from '../../assets/visa.png';
import MasterCardLogo from '../../assets/mastercard.png';
import RuPayLogo from '../../assets/rupay.png';
import AMEXLogo from '../../assets/amex.png';

// Add a mapping of countries to country codes
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

/**
 * Unified checkout component that combines summary, shipping and payment
 * into a single page with a multi-step form
 */
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
  
  // Print environment variables when component mounts to confirm they're properly loaded
  useEffect(() => {
    console.log('UnifiedCheckout component mounted, environment check:');
    logEnvironmentVars();
  }, []);
  
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
  
  // Customer info for enhanced shipping with country code
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES["India"]);
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // Shipping cost calculation variables
  const [shippingCost, setShippingCost] = useState(0);
  const [importDuty, setImportDuty] = useState(0);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [card, setCard] = useState({ number: '', cvv: '', expiry: '', type: 'RuPay' });
  const [upi, setUpi] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderComplete] = useState(false);
  const [savePaymentInfo, setSavePaymentInfo] = useState(true);
  
  // Add state for order data and completion
  const [completedOrder] = useState(null);

  // Coupon validation with reCAPTCHA v3
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();
  const couponInputRef = useRef(null);
  
  // Fetch products for cart
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
            // Ensure price is a number
            price: data.price !== undefined ? parseFloat(data.price) : 0,
            // Ensure mrp is a number if it exists
            mrp: data.mrp !== undefined ? parseFloat(data.mrp) : null,
            // Ensure stock is a number
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
            
            // Auto-fill name if available
            if (userData.name) {
              setCustomerName(userData.name);
            }
            
            // Auto-fill phone if available
            if (userData.phone) {
              // Extract country code from phone number
              let phone = userData.phone;
              let countryCode = '';
              
              // Check for known country codes in the phone number
              for (const country in COUNTRY_CODES) {
                const code = COUNTRY_CODES[country];
                if (phone.startsWith(code)) {
                  countryCode = code;
                  phone = phone.substring(code.length); // Remove country code from number
                  break;
                }
              }
              
              // Set the extracted values
              if (countryCode) {
                setSelectedCountryCode(countryCode);
              }
              setPhoneNumber(phone);
            }
            
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
  
  // Debug: Log email configuration
  useEffect(() => {
    logEnvironmentVars();
  }, []);
  
  // Cart details with product info
  const cartDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);
  
  // Calculate total
  const subtotal = cartDetails.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  
  // Calculate shipping cost based on country and method
  useEffect(() => {
    /**
     * Calculates shipping cost and import duty based on country and shipping method
     */
    const calculateShippingCost = () => {
      let newShippingCost = 0;
      let newImportDuty = 0;
      
      // Free standard shipping if subtotal > 1000 (before discount and GST)
      const qualifiesForFreeShipping = subtotal > 1000;
      
      if (address.country === 'India') {
        // For India
        if (shippingMethod === 'express') {
          newShippingCost = 150; // Express shipping for India
        } else if (!qualifiesForFreeShipping) {
          newShippingCost = 100; // Standard shipping for India if order value < 1000
        }
      } else {
        // For international
        if (shippingMethod === 'express') {
          newShippingCost = 600; // Express shipping for international
        } else {
          newShippingCost = 500; // Standard shipping for international
        }
        
        // Apply import duty for US
        if (address.country === 'United States') {
          newImportDuty = subtotal * 0.69; // 69% import duty for US orders
        }
      }
      
      setShippingCost(newShippingCost);
      setImportDuty(newImportDuty);
    };

    calculateShippingCost();
  }, [address.country, shippingMethod, subtotal]);
  
  // Apply coupon discount if available
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
  // Calculate final total
  const total = subtotal + tax + shippingCost - discountAmount;
  
  /**
   * Validates phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Whether the phone number is valid
   */
  const isValidPhoneNumber = (phone) => {
    // Allow max 12 characters, only numbers, and require at least 7 digits
    return /^[0-9]{7,12}$/.test(phone);
  };
  
  /**
   * Handles phone number input changes
   * @param {Event} e - Input change event
   */
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    // Only update if it's a valid number or empty
    if (value === '' || /^[0-9]{0,12}$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  /**
   * Handles country code selection
   * @param {Event} e - Select change event
   */
  const handleCountryCodeChange = (e) => {
    setSelectedCountryCode(e.target.value);
  };
  
  /**
   * Get full phone number with country code
   * @returns {string} - Full phone number with country code
   */
  const getFullPhoneNumber = () => {
    if (!phoneNumber) return '';
    return `${selectedCountryCode}${phoneNumber}`;
  };

  /**
   * Format price with Indian currency format
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  /**
   * Format card number with spaces
   */
  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  /**
   * Detect card type based on first digits
   */
  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'MasterCard';
    if (/^6/.test(cleanNumber)) return 'RuPay';
    if (/^3[47]/.test(cleanNumber)) return 'AMEX';
    return 'RuPay'; // Default
  };

  /**
   * Handle card number input with formatting
   */
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    const cardType = detectCardType(formattedValue);
    setCard({ ...card, number: formattedValue, type: cardType });
  };

  /**
   * Handle country selection
   * @param {Event} e - Select change event 
   * @note Function defined for future use in UI but not currently used
   */
  // eslint-disable-next-line no-unused-vars
  const handleCountryChange = (e) => {
    setAddress({ ...address, country: e.target.value, state: '' });
  };

  /**
   * Handle state selection
   * @param {Event} e - Select change event
   * @note Function defined for future use in UI but not currently used
   */
  // eslint-disable-next-line no-unused-vars
  const handleStateChange = (e) => {
    setAddress({ ...address, state: e.target.value });
  };

  /**
   * Save customer's shipping address to their profile
   */
  const saveShippingAddress = async () => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        address: address,
        name: customerName,
        // Store phone number with country code for Firebase compatibility
        phone: getFullPhoneNumber()
      });
      
      return true;
    } catch (error) {
      console.error("Error saving shipping address:", error);
      toast.error("Failed to save shipping address. Please try again.");
      return false;
    }
  };

  /**
   * Save payment method to user profile
   */
  const savePaymentMethod = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const paymentMethods = userData.paymentMethods || [];
          
          // Update or add payment method
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
    return true; // Return true if user is not logged in to continue checkout
  };

  /**
   * Process the payment based on the selected payment method
   * @returns {Promise<{success: boolean, error: string|null}>} Result of payment processing
   */
  const processPayment = async () => {
    // In a real implementation, this would integrate with a payment gateway
    // Here we'll just simulate a successful payment
    console.log('Processing payment with method:', paymentMethod);
    
    // Return success for demo purposes
    return { success: true, error: null };
  };

  /**
   * Process the order
   */
  const processOrder = async () => {
    if (!isShippingComplete || !isPaymentComplete) {
      toast.error("Please complete all required information");
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      // Check for any previously purchased items in the cart and remove them
      let removedProductIds = [];
      if (user) {
        try {
          // Get user's order history to check for previously purchased items
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
          
          // Find items in cart that were previously purchased
          const itemsToRemove = cartDetails.filter(item => 
            purchasedProductIds.has(item.productId)
          ).map(item => item.productId);
          
          if (itemsToRemove.length > 0) {
            // Remove purchased items from cart
            dispatch(removePurchasedFromCart(itemsToRemove));
            removedProductIds = itemsToRemove;
            toast.info(`${itemsToRemove.length} previously purchased item(s) were removed from your cart`);
            
            // If all items were removed, redirect to cart
            if (cartDetails.length === itemsToRemove.length) {
              toast.error("All items in your cart have already been purchased");
              setProcessingPayment(false);
              navigate('/cart');
              return;
            }
          }
        } catch (error) {
          console.error("Error checking purchased items:", error);
          // Continue with checkout even if this check fails
        }
      }
      
      // If payment method requires saving, save it
      if (savePaymentInfo) {
        await savePaymentMethod();
      }
      
      // Get updated cart details after potentially removing purchased items
      const updatedCartDetails = cartDetails.filter(item => {
        // Filter out any items that were removed in the removePurchasedFromCart call
        const wasRemoved = removedProductIds.includes(item.productId);
        return !wasRemoved;
      });
      
      // Validate stock one more time
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
        let message = "Some items in your cart are no longer available in the requested quantity:";
        outOfStockItems.forEach(item => {
          message += `\n${item.name}: Requested: ${item.requested}, Available: ${item.available}`;
          
          // Auto-update quantities for out of stock items
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
      
      // Process payment based on selected method
      const paymentResult = await processPayment();
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment failed. Please try again.");
      }
      
      // Log environment variables to help debug
      logEnvironmentVars();
      console.log('Starting order process...');
      
      // Save shipping address
      await saveShippingAddress();
      console.log('Shipping address saved');
      
      // Create the order data object
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
            upiId: upi.split('@')[0] + '@xxxx' // Mask UPI ID for security
          }
        },
        subtotal,
        tax,
        importDuty,
        discount: discountAmount,
        totalAmount: total + importDuty,
        status: "Placed",
        statusHistory: [
          {
            status: "Placed",
            timestamp: new Date().toISOString(),
            note: "Order placed successfully"
          }
        ],
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
      
      // Add coupon information if applied
      if (appliedCoupon && appliedCoupon.code) {
        orderData.coupon = {
          code: appliedCoupon.code,
          discountAmount: appliedCoupon.discountAmount,
          discountType: appliedCoupon.discountType,
          discountValue: appliedCoupon.discountValue
        };
      }
      
      // Record coupon usage if applied (with error handling)
      if (appliedCoupon && appliedCoupon.couponId) {
        try {
          await CouponService.recordCouponUsage(appliedCoupon.couponId);
          console.log('✅ Coupon usage recorded successfully');
        } catch (couponError) {
          console.warn('⚠️ Failed to record coupon usage, but continuing with order:', couponError);
          // Don't fail the entire order if coupon recording fails
        }
      }
      
      // Prepare user data for email
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: customerName || user.displayName || user.email
      };
      
      // Process the order using the order service
      console.log('Processing order...');
      const orderResult = await processNewOrder(orderData, userData);
      
      if (!orderResult.success) {
        console.error("Order processing failed:", orderResult);
        // Use user-friendly error message if available, fallback to technical error
        const errorMessage = orderResult.error || orderResult.technicalError || 'Failed to process order';
        throw new Error(errorMessage);
      }
      
      console.log('Order processed successfully:', orderResult.orderId);
      
      // Log email sending result for debugging
      if (orderResult.emailSent) {
        console.log('✅ Order confirmation email sent successfully');
        toast.success('Order confirmed! Check your email for confirmation details.');
      } else {
        console.warn('⚠️ Order confirmation email failed to send:', orderResult.emailError);
        toast.warning('Order confirmed! Email confirmation may be delayed - please check your account for order details.');
      }
      
      // Finalize the order and transition to confirmation
      setTimeout(() => {
        // Clear the cart
        dispatch(clearCart());
        
        // Redirect to order summary page with order ID and email status
        navigate(`/summary?orderId=${orderResult.orderId}&paymentId=${orderResult.paymentId || 'direct'}&emailSent=${orderResult.emailSent || 'false'}`);
        
        setProcessingPayment(false);
        console.log('Order process completed successfully with ID:', orderResult.orderId);
      }, 1500);
    } catch (error) {
      console.error("Detailed error processing order:", error);
      toast.error("There was an error processing your order. Please try again.");
      setProcessingPayment(false);
    }
  };
  
  /**
   * Check if all required fields are filled
   * @returns {boolean} - Whether all required fields are filled
   */
  const areAllRequiredFieldsFilled = () => {
    // Check customer info
    if (!customerName.trim() || !phoneNumber.trim() || !isValidPhoneNumber(phoneNumber)) {
      return false;
    }

    // Check address fields
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
  
  // Check if shipping and payment sections are complete
  const isShippingComplete = areAllRequiredFieldsFilled();
  const isPaymentComplete = paymentMethod === 'Card' 
    ? Boolean(card.number && card.cvv && card.expiry) 
    : Boolean(upi);
  
  /**
   * Move to next step in checkout
   */
  const nextStep = () => {
    // For step 1 (Cart Summary), just move to shipping
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }
    
    // For step 2 (Shipping), validate all fields before proceeding
    if (currentStep === 2) {
      // Validate required fields
      if (!areAllRequiredFieldsFilled()) {
        toast.error("Please fill all required fields");
        return;
      }
      
      if (!isValidPhoneNumber(phoneNumber)) {
        toast.error("Please enter a valid phone number");
        return;
      }
      
      // If all validations pass, proceed
      setCurrentStep(3);
      return;
    }
    
    // For step 3 (Payment), process the order
    if (currentStep === 3) {
      // Validate payment details
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
      
      // Process the order
      processOrder();
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
  
  /**
   * Handles validating and applying a coupon code
   * @param {Event} e - Form submit event
   */
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    // Validate that the coupon code is alphanumeric and uppercase
    if (!/^[A-Z0-9]+$/.test(couponCode.trim())) {
      setCouponError("Coupon code must contain only uppercase letters and numbers");
      return;
    }
    
    // Clear any previous errors
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
      setCouponError("reCAPTCHA not available. Please try again later.");
      return;
    }
    
    setValidatingCoupon(true);
    
    try {
      // Execute reCAPTCHA and get token
      const recaptchaToken = await executeRecaptcha('apply_coupon');
      
      if (!recaptchaToken) {
        setCouponError("Could not verify human interaction. Please try again.");
        return;
      }
      
      // Pass cart items to validateCoupon for product-specific validation
      const result = await CouponService.validateCoupon(
        couponCode, 
        cartDetails,  // Pass full cart details for product-specific validation
        subtotal,
        user.uid,
        recaptchaToken  // Pass the recaptcha token for server-side verification
      );
      
      if (result.valid) {
        // Apply the coupon to cart state
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
        
        // Clear the input fields
        setCouponCode('');
        
        // Show success message
        toast.success(result.message);
      } else {
        setCouponError(result.message);
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("An error occurred. Please try again.");
    } finally {
      setValidatingCoupon(false);
    }
  };
  
  /**
   * Handles removing an applied coupon
   */
  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.info("Coupon removed");
  };
  
  /**
   * Handle coupon code input validation
   * @param {Event} e - Input change event
   */
  const handleCouponInputChange = (e) => {
    // Only allow uppercase alphanumeric characters
    const value = e.target.value.toUpperCase();
    // Further filter out any non-alphanumeric characters
    const filteredValue = value.replace(/[^A-Z0-9]/g, '');
    setCouponCode(filteredValue);
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
  
  // If order is complete, show the order confirmation
  if (orderComplete && completedOrder) {
    return <OrderConfirmation order={completedOrder} />;
  }
  
  return (
    <m.div 
      className="min-h-screen bg-gray-50 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        {/* Checkout Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <ShoppingBag size={18} />
              </div>
              <span className="text-sm font-medium">Summary</span>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Truck size={18} />
              </div>
              <span className="text-sm font-medium">Shipping</span>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <CreditCard size={18} />
              </div>
              <span className="text-sm font-medium">Payment</span>
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
                  <m.div 
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
                        
                        {/* Applied Coupon */}
                        {appliedCoupon && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Tag className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                  <p className="font-medium text-gray-800">{appliedCoupon.code}</p>
                                  <p className="text-sm text-green-600">
                                    {appliedCoupon.discountType === 'percentage' 
                                      ? `${appliedCoupon.discountValue}% off`
                                      : `₹${appliedCoupon.discountValue} off`
                                    }
                                  </p>
                                </div>
                              </div>
                              <p className="font-medium text-green-600">-{formatPrice(appliedCoupon.discountAmount)}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Price Summary */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">{formatPrice(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Tax (18% GST)</span>
                            <span className="text-gray-900">{formatPrice(tax)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                          </div>
                          
                          {importDuty > 0 && (
                            <div className="flex justify-between text-amber-600">
                              <span>Import Duty (69%)</span>
                              <span>{formatPrice(importDuty)}</span>
                            </div>
                          )}
                          
                          {appliedCoupon && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-{formatPrice(discountAmount)}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                            <span>Total</span>
                            <span>{formatPrice(total + importDuty)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </m.div>
                )}
                
                {currentStep === 2 && (
                  <m.div 
                    key="shipping"
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Information</h2>
                    
                    {/* Customer Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Details</h3>
                      <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        
                        {/* Phone Number with Country Code Dropdown */}
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex">
                            <select
                              value={selectedCountryCode}
                              onChange={handleCountryCodeChange}
                              className="w-24 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            >
                              {Object.keys(COUNTRY_CODES).map((country) => (
                                <option key={country} value={COUNTRY_CODES[country]}>
                                  {COUNTRY_CODES[country]} ({country})
                                </option>
                              ))}
                            </select>
                            <input
                              id="phoneNumber"
                              type="tel"
                              value={phoneNumber}
                              onChange={handlePhoneChange}
                              className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Phone number without country code"
                              maxLength={12}
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Phone number without spaces or special characters
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shipping Address - Restructured */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Shipping Address</h3>
                      <div className="space-y-4">
                        {/* Apartment Number / House Number / House Name */}
                        <div>
                          <label htmlFor="addressHouseNo" className="block text-sm font-medium text-gray-700 mb-1">
                            Apartment/House Number/Name <span className="text-red-500">*</span>
                          </label>
                          <input 
                            id="addressHouseNo"
                            type="text" 
                            value={address.houseNo} 
                            onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Apartment number, House number, or House name"
                            required
                          />
                        </div>
                        
                        {/* Address Line 1 */}
                        <div>
                          <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1 <span className="text-red-500">*</span>
                          </label>
                          <input 
                            id="addressLine1"
                            type="text" 
                            value={address.line1} 
                            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Street address, P.O. box, company name"
                            required
                          />
                        </div>
                        
                        {/* Address Line 2 */}
                        <div>
                          <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2
                          </label>
                          <input 
                            id="addressLine2"
                            type="text" 
                            value={address.line2} 
                            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                          />
                        </div>
                        
                        {/* City and State */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700 mb-1">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input 
                              id="addressCity"
                              type="text" 
                              value={address.city} 
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="City"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="addressState" className="block text-sm font-medium text-gray-700 mb-1">
                              State/Province <span className="text-red-500">*</span>
                            </label>
                            <select 
                              id="addressState"
                              value={address.state} 
                              onChange={(e) => setAddress({ ...address, state: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="" disabled>Select State</option>
                              {countriesStatesData.countries[address.country]?.map((state) => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {/* Country and PIN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <label htmlFor="addressCountry" className="block text-sm font-medium text-gray-700 mb-1">
                              Country <span className="text-red-500">*</span>
                            </label>
                            <select 
                              id="addressCountry"
                              value={address.country} 
                              onChange={(e) => {
                                setAddress({ 
                                  ...address, 
                                  country: e.target.value,
                                  state: '' // Reset state when country changes
                                });
                                // Update country code when country changes
                                setSelectedCountryCode(COUNTRY_CODES[e.target.value] || COUNTRY_CODES["India"]);
                              }}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              {Object.keys(countriesStatesData.countries).map((country) => (
                                <option key={country} value={country}>{country}</option>
                              ))}
                            </select>
                            
                            {/* US Import Duty Notice - Shown directly after country selection */}
                            {address.country === 'United States' && (
                              <div className="mt-2 p-2 bg-amber-50 text-amber-800 text-xs rounded-md border border-amber-200 font-medium animate-pulse-once">
                                ⚠️ US orders subject to 69% import duty
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="addressPin" className="block text-sm font-medium text-gray-700 mb-1">
                              PIN/ZIP Code <span className="text-red-500">*</span>
                            </label>
                            <input 
                              id="addressPin"
                              type="text" 
                              value={address.pin} 
                              onChange={(e) => setAddress({ ...address, pin: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="PIN/ZIP code"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Shipping Method Selection */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Shipping Method</h3>
                      
                      {/* Shipping Information Banner */}
                      <div className={`p-3 rounded-md mb-4 ${subtotal > 1000 ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
                        <p className="text-sm">
                          {subtotal > 1000 
                            ? 'You qualify for free standard shipping!' 
                            : 'Orders above ₹1,000 qualify for free standard shipping.'}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Standard Shipping Option */}
                        <label className={`block border rounded-md p-4 cursor-pointer 
                          ${shippingMethod === 'standard' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="standard"
                              checked={shippingMethod === 'standard'}
                              onChange={() => setShippingMethod('standard')}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                              <span className="block font-medium text-gray-900">Standard Shipping</span>
                              <span className="block text-sm text-gray-500 mt-1">Delivery within 7 days</span>
                              <span className="block text-sm font-medium mt-1">
                                {address.country === 'India'
                                  ? (subtotal > 1000 ? 'Free' : '₹100')
                                  : '₹500'}
                              </span>
                            </div>
                          </div>
                        </label>
                        
                        {/* Express Shipping Option */}
                        <label className={`block border rounded-md p-4 cursor-pointer 
                          ${shippingMethod === 'express' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value="express"
                              checked={shippingMethod === 'express'}
                              onChange={() => setShippingMethod('express')}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                              <span className="block font-medium text-gray-900">Express Shipping</span>
                              <span className="block text-sm text-gray-500 mt-1">Delivery within 2 days</span>
                              <span className="block text-sm font-medium mt-1">
                                {address.country === 'India' ? '₹150' : '₹600'}
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      {/* US Import Duty Warning */}
                      {address.country === 'United States' && (
                        <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                          <p className="text-sm font-medium">Import Duty Notice:</p>
                          <p className="text-sm mt-1">
                            Orders shipped to the United States are subject to a 69% import duty.
                            This will be added to your total order cost.
                          </p>
                        </div>
                      )}
                    </div>
                  </m.div>
                )}
                
                {currentStep === 3 && (
                  <m.div 
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
                            
                            <div className="mt-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={savePaymentInfo}
                                  onChange={() => setSavePaymentInfo(!savePaymentInfo)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">Save card for future purchases</span>
                              </label>
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
                            
                            <div className="mt-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={savePaymentInfo}
                                  onChange={() => setSavePaymentInfo(!savePaymentInfo)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
              
              {/* Navigation buttons moved to right-hand side */}
            </div>
            
            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1 bg-gray-50 p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="sticky top-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                
                {/* Coupon Code Section - New Enhanced Version */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <Tag size={16} className="mr-2 text-blue-500" />
                    Apply Coupon
                  </h4>

                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="space-y-3">
                      {/* Coupon Input with Enhanced UI */}
                      <div className="relative">
                        <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Enter coupon code 
                        </label>
                        <div className="flex">
                          <input
                            id="couponCode"
                            type="text"
                            ref={couponInputRef}
                            value={couponCode}
                            onChange={handleCouponInputChange}
                            placeholder="SUMMER20"
                            className="w-full border border-gray-300 rounded-l-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase bg-white"
                            autoComplete="off"
                            autoCapitalize="characters"
                            style={{ textTransform: 'uppercase' }}
                          />
                          <button
                            type="submit"
                            disabled={validatingCoupon}
                            className={`px-4 rounded-r-md text-white font-medium text-sm transition-colors flex items-center justify-center ${
                              validatingCoupon ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
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
                            className="text-sm text-red-500 mt-2">
                            {couponError}
                          </m.p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Protected by Google reCAPTCHA v3</p>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{appliedCoupon.code}</p>
                          <p className="text-sm text-green-700">
                            {appliedCoupon.discountType === 'percentage' 
                              ? `${appliedCoupon.discountValue}% off`
                              : `₹${appliedCoupon.discountValue} off`
                            }
                            {appliedCoupon.isProductSpecific ? ' on eligible items' : ''}
                          </p>
                        </div>
                        <button 
                          onClick={handleRemoveCoupon}
                          className="text-gray-500 hover:text-red-500 p-1 rounded-full"
                          aria-label="Remove coupon"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                  
                  {importDuty > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Import Duty (69%)</span>
                      <span>{formatPrice(importDuty)}</span>
                    </div>
                  )}
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
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
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={18} className="mr-1" />
                      Back
                    </button>
                  )}
                  
                  <button
                    onClick={nextStep}
                    disabled={(currentStep === 2 && !areAllRequiredFieldsFilled()) || processingPayment || cartDetails.length === 0}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white transition-colors ${
                      (currentStep === 2 && !areAllRequiredFieldsFilled()) || processingPayment || cartDetails.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
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
    </m.div>
  );
}

// Import to show current environment variables (safely)
const logEnvironmentVars = () => {
  console.log('Environment Variables Check:', {
    emailEnabled: process.env.REACT_APP_EMAIL_ENABLED,
    useEmailServer: process.env.REACT_APP_USE_EMAIL_SERVER,
    hasResendApiKey: !!process.env.REACT_APP_RESEND_API_KEY,
    emailFrom: process.env.REACT_APP_EMAIL_FROM,
    emailSupport: process.env.REACT_APP_SUPPORT_EMAIL
  });
};

/**
 * Main UnifiedCheckout component wrapped with GoogleReCaptchaProvider
 */
function UnifiedCheckoutWithRecaptcha() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LcXXXXXXXXXXXXXXXXXXXXX"} // Replace with your actual site key
    >
      <UnifiedCheckout />
    </GoogleReCaptchaProvider>
  );
}

export default UnifiedCheckoutWithRecaptcha;