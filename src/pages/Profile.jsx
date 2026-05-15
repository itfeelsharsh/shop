import React, { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy,
// eslint-disable-next-line no-unused-vars
limit, where,
// eslint-disable-next-line no-unused-vars
deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import countriesStatesData from '../../src/countriesStates.json';
import { m, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Heart,
  Truck,
  ShoppingBag,
  Camera,
  AlertCircle,
  Trash2,
  FileDown,
  Star
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch,
// eslint-disable-next-line no-unused-vars
useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { setWishlistItems } from '../redux/wishlistSlice';
import logger from '../utils/logger';
import useWishlist from '../utils/useWishlist';
import { downloadOrderReceipt } from '../utils/pdfUtils';
import UserReviews from '../components/UserReviews';
import defaultPfp from '../assets/defaultpfp.png';

/**
 * Order status constants with associated colors for UI display
 */
const ORDER_STATUS = {
  PLACED: { label: 'Placed', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  PACKED: { label: 'Packed', color: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  DECLINED: { label: 'Declined', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
};

/**
 * My Account page with multiple sections for profile management,
 * orders, wishlist, shipment tracking, and reviews
 * 
 * Now with URL-based navigation for each section:
 * - /my-account/profile (default)
 * - /my-account/payment-methods
 * - /my-account/orders
 * - /my-account/track-shipment
 * - /my-account/wishlist
 * - /my-account/reviews
 */
function MyAccount() {
  // Get the current section from URL parameters
  const { section } = useParams();
  const currentSection = section || 'profile';
  
  const [user] = useAuthState(auth);
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
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [wishlistLoading, setWishlistLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const dispatch = useDispatch();
  const { 
    wishlistItems: hookWishlistItems, 
    loading: wishlistHookLoading,
    removeFromWishlist: removeWishlistItem
  } = useWishlist();

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
            

            
            logger.firebase.read(`users/${user.uid}`, { 
              name: userData.name,
              email: userData.email
            });
          } else {
            toast.warn("No profile data found. Please update your profile.");
            logger.warn("No user profile data found", null, "Profile");
          }
        } catch (error) {
          toast.error("Error loading profile: " + error.message);
          logger.firebase.error(`users/${user.uid}`, "getDoc", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [user]);

  /**
   * Fetch user orders from Firestore
   * Memoized with useCallback to prevent repeated calls and console spam
   */
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    // Check if we've already fetched orders to prevent repeated calls
    if (orders.length > 0 && !ordersLoading) return;
    
    logger.user.action("View Orders", { userId: user.uid });

    try {
      setOrdersLoading(true);
      
      // Get all orders for this user
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("orderDate", "desc")
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = [];
      
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === user.uid) {
          // Ensure totalAmount is calculated if missing
          // This fixes potential issues with older orders in the database
          if (!data.totalAmount && !data.total) {
            // Calculate total based on available fields
            const subtotal = data.subtotal || 0;
            const tax = data.tax || 0;
            const shipping = data.shipping?.cost || 0;
            const discount = data.discount || 0;
            const importDuty = data.importDuty || 0;
            
            // Set totalAmount using the same calculation used in checkout
            data.totalAmount = subtotal + tax + shipping + importDuty - discount;
            
            // Log the calculated total for debugging
            console.log(`Calculated missing total for order ${data.orderId}:`, {
              subtotal, tax, shipping, discount, importDuty,
              calculatedTotal: data.totalAmount
            });
          }
          
          ordersData.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      setOrders(ordersData);
      logger.firebase.read("orders", { count: ordersData.length });
    } catch (error) {
      logger.firebase.error("orders", "getDocs", error);
      toast.error("Error loading orders: " + error.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [user, orders.length, ordersLoading]);

  /**
   * Fetch user wishlist items from Firebase
   * This is now handled by the useWishlist hook 
   * Memoized with useCallback to prevent repeated calls
   */
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    
    // Only log once per section activation
    logger.user.action("View Wishlist", { userId: user.uid });
    // The actual fetching is handled by the useWishlist hook
  }, [user]);

  // Load data based on the current section
  useEffect(() => {
    if (currentSection === 'orders' || currentSection === 'track-shipment') {
      fetchOrders();
    } else if (currentSection === 'wishlist') {
      fetchWishlist();
    }
  }, [currentSection, fetchOrders, fetchWishlist]);

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
   * Removes a product from the wishlist
   * @param {string} productId - ID of the product to remove
   */
  const handleRemoveFromWishlist = async (productId) => {
    await removeWishlistItem(productId);
  };

  /**
   * Format price as currency
   * 
   * @param {number} price - Price to format
   * @returns {string} Formatted price
   * 
   * IMPORTANT: There's inconsistency in the database schema where some order records
   * use 'totalAmount' field while others might use 'total' field for the order total.
   * The email service uses 'totalAmount', so we prioritize that field but fall back to 'total' 
   * if needed to ensure consistent display across all app sections.
   * This prevents "₹0.00" or "NaN" issues in the UI and PDF generation.
   */
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0.00';
    
    const num = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle NaN, just in case
    if (isNaN(num)) return '₹0.00';
    
    // Extract integer and decimal parts
    const parts = num.toFixed(2).split('.');
    const integer = parts[0];
    const decimalPart = parts[1];
    
    // Add thousands separators to integer part
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted string
    return `₹${decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger}`;
  };

  /**
   * Format date in a more readable format
   * 
   * @param {string|number|Date} date - The date to format
   * @returns {string} Formatted date
   */
  const formatOrderDate = (date) => {
    if (!date) return 'N/A';
    
    const orderDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(orderDate.getTime())) return 'Invalid date';
    
    // If the date is in the future (except for a small tolerance of 1 day),
    // it's likely a timestamp error. Use current date instead.
    const now = new Date();
    if (orderDate > new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return orderDate.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  /**
   * Handle downloading an order receipt
   * @param {object} order - The order object
   */
  const handleDownloadReceipt = async (order) => {
    try {
      toast.info('Preparing your receipt...');
      
      // Ensure the order has a valid total amount for the PDF generation
      const orderCopy = { ...order };
      
      // Check and calculate totalAmount if missing to avoid NaN in the PDF
      if (!orderCopy.totalAmount && !orderCopy.total) {
        const subtotal = orderCopy.subtotal || 0;
        const tax = orderCopy.tax || 0;
        const shipping = orderCopy.shipping?.cost || 0;
        const discount = orderCopy.discount || 0;
        const importDuty = orderCopy.importDuty || 0;
        
        // Calculate and set the total amount
        orderCopy.totalAmount = subtotal + tax + shipping + importDuty - discount;
        
        console.log('Calculated missing total for PDF receipt:', {
          orderId: orderCopy.orderId,
          calculatedTotal: orderCopy.totalAmount
        });
      }
      
      await downloadOrderReceipt(orderCopy);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <Helmet>
        <title>My Account | KamiKoto</title>
        <meta name="description" content="Manage your KamiKoto account, view orders, and update your profile." />
      </Helmet>
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 px-2 sm:px-0">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
            <p className="text-gray-500 text-lg mt-1">Manage your profile, orders, and more</p>
          </div>
          
          {/* Navigation Tab Bar */}
          <div className="relative z-20 mb-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
                <div className="flex p-2 gap-1">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'orders', label: 'Orders', icon: ShoppingBag },
                    { id: 'track-shipment', label: 'Track Shipment', icon: Truck },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    { id: 'reviews', label: 'Reviews', icon: Star }
                  ].map((tab) => (
                    <Link
                      key={tab.id}
                      to={`/my-account/${tab.id}`}
                      className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                        currentSection === tab.id
                          ? 'bg-gray-900 text-white shadow-lg'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon size={16} className={`mr-2.5 transition-colors ${currentSection === tab.id ? 'text-white' : 'text-gray-400'}`} />
                      {tab.label}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Contextual Loading Bar */}
              <AnimatePresence>
                {(loading || ordersLoading || wishlistHookLoading) && (
                  <m.div 
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 origin-left z-30"
                    transition={{ duration: 0.8, ease: "circOut" }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="relative z-10">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-200 min-h-[600px] overflow-hidden">
              <AnimatePresence mode="wait">
                <m.div
                  key={currentSection}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="p-6 md:p-12"
                >
                  {currentSection === 'profile' && (
                    <div className="space-y-12">
                      <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <div className="relative group">
                          <img
                            src={profile.profilePic || defaultPfp}
                            alt="Profile"
                            className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute -bottom-2 -right-2 p-2 bg-gray-900 text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                            <Camera size={18} />
                          </div>
                        </div>

                        <div className="flex-grow">
                          <h2 className="text-3xl font-black text-gray-900">{profile.name || 'Welcome back'}</h2>
                          <p className="text-gray-500 font-medium">{profile.email}</p>
                          <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">Verified</span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">Member</span>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="bg-gray-50/50 rounded-3xl p-6 md:p-8 border border-gray-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <User size={20} className="mr-3 text-gray-400" />
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} required icon={User} className="bg-white border-gray-200 rounded-2xl" />
                            <Input label="Email Address" name="email" value={profile.email} disabled icon={AlertCircle} className="bg-gray-100 border-gray-200 rounded-2xl" />
                            <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} icon={Truck} className="bg-white border-gray-200 rounded-2xl" />
                            <Input label="Profile Picture URL" name="profilePic" value={profile.profilePic} onChange={handleChange} icon={Camera} className="bg-white border-gray-200 rounded-2xl" />
                          </div>
                        </div>
                        
                        <div className="bg-gray-50/50 rounded-3xl p-6 md:p-8 border border-gray-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <MapPin size={20} className="mr-3 text-gray-400" />
                            Shipping Address
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                              <label className="block text-sm font-bold text-gray-600 mb-2">House / Plot No.</label>
                              <input type="text" name="address.houseNo" value={profile.address.houseNo} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-2xl bg-white" />
                            </div>
                            <div className="md:col-span-1">
                              <label className="block text-sm font-bold text-gray-600 mb-2">PIN Code</label>
                              <input type="text" name="address.pin" value={profile.address.pin} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-2xl bg-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-bold text-gray-600 mb-2">Address Line 1</label>
                              <input type="text" name="address.line1" value={profile.address.line1} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-2xl bg-white" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 md:col-span-2 gap-6">
                              <input type="text" name="address.city" value={profile.address.city} onChange={handleChange} placeholder="City" className="w-full p-4 border border-gray-200 rounded-2xl bg-white" />
                              <select name="address.country" value={profile.address.country} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-2xl bg-white">
                                {Object.keys(countriesStatesData.countries).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <select name="address.state" value={profile.address.state} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-2xl bg-white">
                                <option value="">State</option>
                                {profile.address.country && countriesStatesData.countries[profile.address.country]?.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit" variant="primary" isLoading={saveLoading} loadingText="Updating..." className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold">
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {currentSection === 'orders' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black text-gray-900">My Orders</h2>
                      {ordersLoading ? (
                        <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div></div>
                      ) : orders.length === 0 ? (
                        <div className="bg-gray-50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
                          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
                          <Link to="/products" className="inline-flex items-center px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold mt-4">Explore Shop</Link>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {orders.map((order) => (
                            <div key={order.id} className="group border border-gray-200 rounded-[2rem] overflow-hidden bg-white hover:shadow-xl transition-all">
                              <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex gap-8">
                                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DATE</p><p className="text-sm font-bold text-gray-900">{formatOrderDate(order.orderDate)}</p></div>
                                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</p><p className="text-sm font-bold text-gray-900">{order.orderId}</p></div>
                                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">STATUS</p><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${ORDER_STATUS[order.status?.toUpperCase()]?.color || 'bg-gray-100 text-gray-800'}`}>{order.status}</span></div>
                                </div>
                                <button onClick={() => handleDownloadReceipt(order)} className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-900 hover:text-white transition-all"><FileDown size={20} /></button>
                              </div>
                              <div className="p-6 md:p-8 space-y-6">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-6">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-xl border border-gray-100" />
                                    <div className="flex-grow"><h4 className="text-lg font-bold text-gray-900">{item.name}</h4><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div>
                                    <p className="text-xl font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                  </div>
                                ))}
                                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                  <div><p className="text-sm font-bold text-gray-400 uppercase tracking-widest">TOTAL</p><p className="text-3xl font-black text-gray-900 tracking-tight">{formatPrice(order.totalAmount || order.total)}</p></div>
                                  <Link to={`/my-account/track-shipment`} className="text-gray-900 font-black text-sm uppercase tracking-widest border-b-2 border-gray-900 pb-1">Track info</Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentSection === 'track-shipment' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black text-gray-900">Track Shipment</h2>
                      <div className="bg-gray-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden">
                        <div className="relative z-10"><h3 className="text-2xl font-black mb-2 flex items-center"><Truck className="mr-3 text-blue-400" /> India Post</h3><p className="text-gray-400 text-lg">Official partner for KamiKoto deliveries. Real-time tracking via consignment ID.</p></div>
                        <Truck size={200} className="absolute -top-10 -right-10 opacity-10" />
                      </div>
                      <div className="grid gap-8">
                        {orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length === 0 ? (
                          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border border-gray-100"><p className="text-gray-500 font-bold">No active shipments to track.</p></div>
                        ) : (
                          orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').map(order => (
                            <div key={order.id} className="border-2 border-gray-100 rounded-[2rem] p-8 bg-white shadow-sm hover:border-gray-900 transition-all">
                              <div className="flex justify-between items-center gap-8">
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CONSIGNMENT ID</p><p className="font-mono text-3xl font-black text-gray-900 tracking-tighter">{order.tracking?.code || 'PENDING'}</p></div>
                                <a href="https://www.indiapost.gov.in" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Open Tracker</a>
                              </div>
                              <p className="mt-6 text-sm text-gray-500">Order ID: <span className="font-bold text-gray-900">{order.orderId}</span></p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {currentSection === 'wishlist' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black text-gray-900">My Wishlist</h2>
                      {wishlistHookLoading ? (
                        <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div></div>
                      ) : hookWishlistItems.length === 0 ? (
                        <div className="bg-gray-50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
                          <Heart size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-2xl font-bold text-gray-900">Wishlist empty</h3>
                          <Link to="/products" className="inline-flex items-center px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold mt-6 tracking-widest">Discover Items</Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {hookWishlistItems.map(item => (
                            <div key={item.id} className="group bg-white rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-900 transition-all hover:shadow-2xl">
                              <div className="aspect-square relative overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <button onClick={() => handleRemoveFromWishlist(item.id)} className="absolute top-4 right-4 p-3 bg-white/90 rounded-2xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12"><Trash2 size={20} /></button>
                              </div>
                              <div className="p-6">
                                <h4 className="font-black text-gray-900 mb-2 line-clamp-1">{item.name}</h4><p className="text-2xl font-black text-gray-900 mb-6">{formatPrice(item.price)}</p>
                                <Link to={`/product/${item.id}`} className="w-full inline-flex justify-center py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">View Details</Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentSection === 'reviews' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black text-gray-900">Your Reviews</h2>
                      <div className="bg-gray-50 rounded-[2.5rem] p-8"><UserReviews /></div>
                    </div>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAccount;
