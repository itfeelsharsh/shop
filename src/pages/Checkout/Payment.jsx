import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VisaLogo from '../../assets/visa.png';
import MasterCardLogo from '../../assets/mastercard.png';
import RuPayLogo from '../../assets/rupay.png';
import AMEXLogo from '../../assets/amex.png';

/**
 * Checkout Payment Component
 * 
 * Allows users to save payment methods (card or UPI)
 * Validates card and UPI details
 * Persists saved payment methods to Firestore
 * 
 * @returns {JSX.Element} Payment component
 */
function CheckoutPayment() {
  const [user] = useAuthState(auth);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [card, setCard] = useState({ number: '', cvv: '', expiry: '', type: 'RuPay' });
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const navigate = useNavigate();

  /**
   * Fetch user's saved payment methods from Firestore
   */
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDocSnapshot = await getDoc(userRef);
          
          if (userDocSnapshot.exists()) {
            const userDoc = userDocSnapshot.data();
            const savedMethods = userDoc.paymentMethods || [];
            setPaymentMethods(savedMethods);
            
            // Set default payment method if available
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
          console.error("Error fetching payment methods:", error);
          toast.error("Failed to load saved payment methods.");
        }
      }
    };
    
    fetchPaymentMethods();
  }, [user]);

  /**
   * Format card number with spaces
   * 
   * @param {string} value - Raw card number
   * @returns {string} Formatted card number
   */
  const formatCardNumber = (value) => {
    return value.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  /**
   * Detect card type based on number pattern
   * 
   * @param {string} number - Card number
   * @returns {string} Detected card type
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
   * 
   * @param {Event} e - Change event
   */
  const handleCardNumberChange = (e) => {
    const formattedNumber = formatCardNumber(e.target.value);
    const detectedType = detectCardType(formattedNumber);
    setCard({ ...card, number: formattedNumber, type: detectedType });
    setPaymentMethod('Card'); 
  };

  /**
   * Save payment method to Firestore
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You need to be signed in to save a payment method.");
      return;
    }
    
    setLoading(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userRef);
      
      if (!userDocSnapshot.exists()) {
        throw new Error("User document does not exist.");
      }
      
      const userDoc = userDocSnapshot.data();
      const existingPaymentMethods = Array.isArray(userDoc.paymentMethods) ? userDoc.paymentMethods : [];
      let updatedPaymentMethods = [...existingPaymentMethods];
      
      if (paymentMethod === 'Card') {
        // Format and validate card data
        const cardNumber = card.number.replace(/\s+/g, '');
        const cvv = card.cvv.trim();
        const expiry = card.expiry.trim();
        const cardType = card.type;
        
        // Validation checks
        if (!/^\d{12,}$/.test(cardNumber)) {
          toast.error("Invalid card number. It should have at least 12 digits.");
          setLoading(false);
          return;
        }
        
        if (!/^\d{3,4}$/.test(cvv)) {
          toast.error("Invalid CVV. It should be 3 or 4 digits.");
          setLoading(false);
          return;
        }
        
        if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) {
          toast.error("Invalid expiry date. Format should be MM/YY.");
          setLoading(false);
          return;
        }
        
        // Remove duplicate cards (based on last 4 digits)
        const lastFour = cardNumber.slice(-4);
        updatedPaymentMethods = updatedPaymentMethods.filter(method => 
          !method.cardNumber || method.cardNumber.slice(-4) !== lastFour
        );
        
        // Add the new card
        updatedPaymentMethods.push({ 
          cardNumber, 
          cvv, 
          expiry, 
          type: cardType 
        });
      } else {
        // Format and validate UPI ID
        const trimmedUpi = upi.trim();
        
        // Validate UPI ID format
        if (!/@/.test(trimmedUpi)) {
          toast.error("Invalid UPI ID. It should contain '@'.");
          setLoading(false);
          return;
        }
        
        // Remove duplicate UPI IDs
        updatedPaymentMethods = updatedPaymentMethods.filter(method => 
          !method.upi || method.upi !== trimmedUpi
        );
        
        // Add the new UPI ID
        updatedPaymentMethods.push({ upi: trimmedUpi });
      }
      
      // Update the user document with the new payment methods
      await updateDoc(userRef, { paymentMethods: updatedPaymentMethods });
      
      toast.success("Payment method saved successfully!");
      
      // Redirect to cart or checkout
      navigate('/cart');
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast.error("Failed to save payment method. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get card logo based on card type
   * 
   * @returns {JSX.Element} Card logo image
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
   * Render saved payment methods
   * 
   * @returns {JSX.Element} Saved payment methods list
   */
  const renderSavedPaymentMethods = () => {
    if (paymentMethods.length === 0) {
      return (
        <div className="text-gray-500 text-center py-4">
          No saved payment methods.
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Saved Payment Methods</h3>
        
        {/* Card methods */}
        {paymentMethods.filter(method => method.cardNumber).map((method, index) => (
          <div key={`card-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              {method.type && (
                <span className="flex-shrink-0">
                  {method.type === 'Visa' && <img src={VisaLogo} alt="Visa" className="w-10" />}
                  {method.type === 'MasterCard' && <img src={MasterCardLogo} alt="MasterCard" className="w-10" />}
                  {method.type === 'RuPay' && <img src={RuPayLogo} alt="RuPay" className="w-10" />}
                  {method.type === 'AMEX' && <img src={AMEXLogo} alt="AMEX" className="w-10" />}
                </span>
              )}
              <div>
                <p className="font-medium text-gray-800">
                  Card ending in {method.cardNumber.slice(-4)}
                </p>
                <p className="text-xs text-gray-500">
                  Expires {method.expiry}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => {
                setCard({
                  number: method.cardNumber,
                  cvv: method.cvv,
                  expiry: method.expiry,
                  type: method.type || 'RuPay',
                });
                setPaymentMethod('Card');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Use
            </button>
          </div>
        ))}
        
        {/* UPI methods */}
        {paymentMethods.filter(method => method.upi).map((method, index) => (
          <div key={`upi-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-800">
                UPI ID: {method.upi}
              </p>
            </div>
            <button 
              type="button"
              onClick={() => {
                setUpi(method.upi);
                setPaymentMethod('UPI');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Use
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Payment Methods</h1>
        
        {/* Display saved payment methods */}
        {user && renderSavedPaymentMethods()}
        
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Payment Method</h2>
          
          {paymentMethod === 'Card' && (
            <div className="flex justify-center mb-4">
              {getCardLogo()}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Select Payment Method:</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            
            {paymentMethod === 'Card' ? (
              <>
                <input 
                  type="text" 
                  placeholder="Card Number" 
                  value={card.number}
                  onChange={handleCardNumberChange} 
                  required 
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
                <div className="flex space-x-4">
                  <input 
                    type="text" 
                    placeholder="CVV" 
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })} 
                    required 
                    className="w-1/2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                  <input 
                    type="text" 
                    placeholder="Expiry Date (MM/YY)" 
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })} 
                    required 
                    className="w-1/2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
                <select 
                  value={card.type} 
                  onChange={(e) => setCard({ ...card, type: e.target.value })} 
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="RuPay">RuPay (0% fee)</option>
                  <option value="Visa">Visa (2% fee)</option>
                  <option value="MasterCard">MasterCard (2% fee)</option>
                  <option value="AMEX">AMEX (1% fee)</option>
                </select>
              </>
            ) : (
              <input 
                type="text" 
                placeholder="UPI ID" 
                value={upi}
                onChange={(e) => setUpi(e.target.value)} 
                required 
                className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            )}
            
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/cart')}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Payment Method"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPayment;
