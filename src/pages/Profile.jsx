import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import countriesStatesData from '../../src/countriesStates.json';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Heart, 
  Truck, 
  ShoppingBag, 
  Camera, 
  AlertCircle, 
  CreditCard,
  Trash2
} from 'lucide-react';

/**
 * My Account page with multiple sections for profile management,
 * orders, wishlist, and shipment tracking
 */
function MyAccount() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    phone: '',
    address: {
      houseNo: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'India',
      pin: ''
    },
    profilePic: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    cardType: 'Visa',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    upiId: ''
  });

  useEffect(() => {
    /**
     * Fetch user profile data from Firestore
     */
    const fetchProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              email: userData.email || '',
              name: userData.name || '',
              phone: userData.phone || '',
              address: {
                houseNo: userData.address?.houseNo || '',
                line1: userData.address?.line1 || '',
                line2: userData.address?.line2 || '',
                city: userData.address?.city || '',
                state: userData.address?.state || '',
                country: userData.address?.country || 'India',
                pin: userData.address?.pin || ''
              },
              profilePic: userData.profilePic || ''
            });
            
            // Set payment methods
            setPaymentMethods(userData.paymentMethods || []);
          } else {
            toast.warn("No profile data found. Please update your profile.");
          }
        } catch (error) {
          toast.error("Error loading profile: " + error.message);
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [user]);

  /**
   * Handle input field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addrField = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        address: { ...prev.address, [addrField]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handle form submission to update profile
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        setSaveLoading(true);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          profilePic: profile.profilePic
        });
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Error updating profile: " + error.message);
        console.error("Error updating profile:", error);
      } finally {
        setSaveLoading(false);
      }
    }
  };

  /**
   * Get card logo based on card type
   */
  const getCardLogo = (cardType) => {
    switch(cardType) {
      case 'Visa':
        return "/visa.png";
      case 'MasterCard':
        return "/mastercard.png";
      case 'RuPay':
        return "/rupay.png";
      case 'AMEX':
        return "/amex.png";
      default:
        return null;
    }
  };

  /**
   * Format card number to show only last 4 digits
   */
  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const last4 = cardNumber.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  /**
   * Handle payment method form input change
   */
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentMethod(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle adding a new payment method
   */
  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaveLoading(true);
      const userRef = doc(db, "users", user.uid);
      
      const paymentMethod = newPaymentMethod.type === 'card' 
        ? {
            type: 'card',
            cardType: newPaymentMethod.cardType,
            cardNumber: newPaymentMethod.cardNumber,
            cardExpiry: newPaymentMethod.cardExpiry,
            cardCVV: newPaymentMethod.cardCVV
          }
        : {
            type: 'upi',
            upiId: newPaymentMethod.upiId
          };
      
      // Add to existing methods
      const updatedMethods = [...paymentMethods, paymentMethod];
      
      await updateDoc(userRef, { paymentMethods: updatedMethods });
      setPaymentMethods(updatedMethods);
      
      // Reset form
      setNewPaymentMethod({
        type: 'card',
        cardType: 'Visa',
        cardNumber: '',
        cardExpiry: '',
        cardCVV: '',
        upiId: ''
      });
      
      toast.success("Payment method added successfully!");
    } catch (error) {
      toast.error("Error adding payment method: " + error.message);
      console.error("Error adding payment method:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  /**
   * Handle removing a payment method
   */
  const handleRemovePaymentMethod = async (index) => {
    if (!user) return;
    
    try {
      setSaveLoading(true);
      const userRef = doc(db, "users", user.uid);
      
      const updatedMethods = [...paymentMethods];
      updatedMethods.splice(index, 1);
      
      await updateDoc(userRef, { paymentMethods: updatedMethods });
      setPaymentMethods(updatedMethods);
      
      toast.success("Payment method removed successfully!");
    } catch (error) {
      toast.error("Error removing payment method: " + error.message);
      console.error("Error removing payment method:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600 mb-8">Manage your profile, orders, and more</p>
          
          {/* Tabs */}
          <div className="bg-white rounded-t-2xl shadow-md overflow-hidden border border-gray-200">
            <div className="flex flex-wrap">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center py-4 px-6 focus:outline-none transition-colors ${
                  activeTab === 'profile' 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User size={18} className="mr-2" />
                <span>Profile</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('payment')}
                className={`flex items-center py-4 px-6 focus:outline-none transition-colors ${
                  activeTab === 'payment' 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard size={18} className="mr-2" />
                <span>Payment Methods</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center py-4 px-6 focus:outline-none transition-colors ${
                  activeTab === 'orders' 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingBag size={18} className="mr-2" />
                <span>Orders</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('track')}
                className={`flex items-center py-4 px-6 focus:outline-none transition-colors ${
                  activeTab === 'track' 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Truck size={18} className="mr-2" />
                <span>Track Shipment</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center py-4 px-6 focus:outline-none transition-colors ${
                  activeTab === 'wishlist' 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Heart size={18} className="mr-2" />
                <span>Wishlist</span>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white rounded-b-2xl shadow-md p-6 md:p-8 border-t-0 border border-gray-200">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative">
                    <img 
                      src={profile.profilePic || 'https://via.placeholder.com/150?text=Profile'} 
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border shadow-md"
                    />
                    <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md">
                      <Camera size={16} className="text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h2 className="text-2xl font-semibold text-gray-800">{profile.name || 'Welcome'}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User size={18} className="mr-2" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={profile.name}
                          onChange={handleChange}
                          required 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={profile.email}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                          disabled
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          name="phone" 
                          value={profile.phone}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                        <input 
                          type="text" 
                          name="profilePic" 
                          value={profile.profilePic}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MapPin size={18} className="mr-2" />
                      Address Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">House/Apartment Number</label>
                        <input 
                          type="text" 
                          name="address.houseNo" 
                          value={profile.address.houseNo}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <input 
                          type="text" 
                          name="address.line1" 
                          value={profile.address.line1}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input 
                          type="text" 
                          name="address.line2" 
                          value={profile.address.line2}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input 
                          type="text" 
                          name="address.city" 
                          value={profile.address.city}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                        <input 
                          type="text" 
                          name="address.pin" 
                          value={profile.address.pin}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select
                          name="address.country"
                          value={profile.address.country}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.keys(countriesStatesData.countries).map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                          name="address.state"
                          value={profile.address.state}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          {profile.address.country && countriesStatesData.countries[profile.address.country]?.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <span className="flex items-center justify-center">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">Payment Methods</h3>
                    <p className="text-gray-600 mt-1">Manage your saved payment methods</p>
                  </div>
                  
                  <button
                    onClick={() => document.getElementById('add-payment-form').scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">+</span> Add Payment Method
                  </button>
                </div>
                
                {/* Saved Payment Methods */}
                <div className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <CreditCard className="mx-auto text-gray-400 mb-3" size={32} />
                      <p className="text-gray-600">No payment methods saved yet</p>
                    </div>
                  ) : (
                    paymentMethods.map((method, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {method.type === 'card' ? (
                          <div className="flex items-center gap-4">
                            {method.cardType && (
                              <div className="w-12 h-8 bg-gray-100 flex items-center justify-center rounded">
                                <img 
                                  src={getCardLogo(method.cardType)} 
                                  alt={method.cardType} 
                                  className="h-5 object-contain"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{method.cardType} Card</p>
                              <p className="text-gray-600 text-sm">{formatCardNumber(method.cardNumber)}</p>
                              {method.cardExpiry && (
                                <p className="text-gray-500 text-xs">Expires: {method.cardExpiry}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gray-100 flex items-center justify-center rounded">
                              <span className="text-sm font-medium text-gray-800">UPI</span>
                            </div>
                            <div>
                              <p className="font-medium">UPI ID</p>
                              <p className="text-gray-600 text-sm">{method.upiId}</p>
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => handleRemovePaymentMethod(index)}
                          className="self-end md:self-center flex items-center text-red-600 hover:text-red-700 gap-1 text-sm"
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Add Payment Method Form */}
                <div id="add-payment-form" className="bg-gray-50 rounded-lg p-6 mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h4>
                  
                  <form onSubmit={handleAddPaymentMethod} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="type"
                              value="card"
                              checked={newPaymentMethod.type === 'card'}
                              onChange={handlePaymentChange}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>Card</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="type"
                              value="upi"
                              checked={newPaymentMethod.type === 'upi'}
                              onChange={handlePaymentChange}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>UPI</span>
                          </label>
                        </div>
                      </div>
                      
                      {newPaymentMethod.type === 'card' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                            <select
                              name="cardType"
                              value={newPaymentMethod.cardType}
                              onChange={handlePaymentChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Visa">Visa</option>
                              <option value="MasterCard">MasterCard</option>
                              <option value="RuPay">RuPay</option>
                              <option value="AMEX">American Express</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={newPaymentMethod.cardNumber}
                              onChange={handlePaymentChange}
                              placeholder="1234 5678 9012 3456"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              maxLength={19}
                              required={newPaymentMethod.type === 'card'}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                              <input
                                type="text"
                                name="cardExpiry"
                                value={newPaymentMethod.cardExpiry}
                                onChange={handlePaymentChange}
                                placeholder="MM/YY"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={5}
                                required={newPaymentMethod.type === 'card'}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                              <input
                                type="password"
                                name="cardCVV"
                                value={newPaymentMethod.cardCVV}
                                onChange={handlePaymentChange}
                                placeholder="123"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={4}
                                required={newPaymentMethod.type === 'card'}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                          <input
                            type="text"
                            name="upiId"
                            value={newPaymentMethod.upiId}
                            onChange={handlePaymentChange}
                            placeholder="username@upi"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required={newPaymentMethod.type === 'upi'}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                        disabled={saveLoading}
                      >
                        {saveLoading ? (
                          <span className="flex items-center justify-center">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            Saving...
                          </span>
                        ) : (
                          'Add Payment Method'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="max-w-md text-center">
                  <div className="bg-blue-50 rounded-full p-6 inline-block mb-6">
                    <ShoppingBag size={48} className="text-blue-600" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Order History</h3>
                  <p className="text-gray-600 mb-6">
                    View and track all your past and current orders in one place.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left">
                    <div className="flex items-start">
                      <AlertCircle className="text-blue-600 mr-3 h-5 w-5 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">Coming Soon</p>
                        <p className="text-blue-700 text-sm mt-1">We're currently building this feature. Check back soon for your complete order history.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Track Shipment Tab */}
            {activeTab === 'track' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="max-w-md text-center">
                  <div className="bg-blue-50 rounded-full p-6 inline-block mb-6">
                    <Truck size={48} className="text-blue-600" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Track Your Shipments</h3>
                  <p className="text-gray-600 mb-6">
                    Stay updated with the real-time status of your orders and track their journey to your doorstep.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left">
                    <div className="flex items-start">
                      <AlertCircle className="text-blue-600 mr-3 h-5 w-5 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">Coming Soon</p>
                        <p className="text-blue-700 text-sm mt-1">We're working on this feature to help you track your shipments with ease. Check back soon!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="max-w-md text-center">
                  <div className="bg-red-50 rounded-full p-6 inline-block mb-6">
                    <Heart size={48} className="text-red-500" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Wishlist</h3>
                  <p className="text-gray-600 mb-6">
                    Save your favorite items for later and never lose track of products you love.
                  </p>
                  
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-3 h-5 w-5 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Coming Soon</p>
                        <p className="text-red-700 text-sm mt-1">We're building this feature to help you keep track of all your favorite products. Check back soon!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
    </div>
  );
}

export default MyAccount;
