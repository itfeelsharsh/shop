import React, { useEffect, useState, useCallback, useRef } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
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
  Star,
  LogOut,
  ChevronRight,
  Copy
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import logger from '../utils/logger';
import useWishlist from '../utils/useWishlist';
import { downloadOrderReceipt } from '../utils/pdfUtils';
import UserReviews from '../components/UserReviews';
import defaultPfp from '../assets/defaultpfp.png';

const ORDER_STATUS = {
  PLACED: { label: 'Placed', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  APPROVED: { label: 'Approved', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  PACKED: { label: 'Packed', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-100' },
  DECLINED: { label: 'Declined', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-50 text-gray-600 border-gray-150' }
};

function MyAccount() {
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
  const { 
    wishlistItems: hookWishlistItems, 
    loading: wishlistHookLoading,
    removeFromWishlist: removeWishlistItem
  } = useWishlist();
  const ordersHasBeenFetched = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        // Reset orders fetch flag when user changes
        ordersHasBeenFetched.current = false;
        
        // Pre-populate with auth user info and cache before network request completes
        const cachedProfile = sessionStorage.getItem(`profile_${user.uid}`);
        let initialName = user.displayName || '';
        let initialPic = user.photoURL || '';
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            initialName = parsed.name || initialName;
            initialPic = parsed.profilePic || initialPic;
          } catch (e) {
            logger.error("Failed to parse cached profile in Profile.jsx", e, "Profile");
          }
        }
        
        setProfile(prev => ({
          ...prev,
          email: user.email || '',
          name: prev.name || initialName,
          profilePic: prev.profilePic || initialPic
        }));

        try {
          setLoading(true);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              email: userData.email || user.email || '',
              name: userData.name || user.displayName || '',
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
              profilePic: userData.profilePic || user.photoURL || ''
            });
            logger.firebase.read(`users/${user.uid}`, { 
              name: userData.name,
              email: userData.email
            });
          } else {
            // User doc doesn't exist yet, but we have their Auth credentials
            logger.warn("No user profile document found in Firestore, using Auth fallback", null, "Profile");
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

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    if (ordersHasBeenFetched.current) return; // Prevent repeated fetches
    
    logger.user.action("View Orders", { userId: user.uid });

    try {
      setOrdersLoading(true);
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
          if (!data.totalAmount && !data.total) {
            const subtotal = data.subtotal || 0;
            const tax = data.tax || 0;
            const shipping = data.shipping?.cost || 0;
            const discount = data.discount || 0;
            const importDuty = data.importDuty || 0;
            data.totalAmount = subtotal + tax + shipping + importDuty - discount;
          }
          ordersData.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      setOrders(ordersData);
      ordersHasBeenFetched.current = true; // Mark as fetched
      logger.firebase.read("orders", { count: ordersData.length });
    } catch (error) {
      logger.firebase.error("orders", "getDocs", error);
      toast.error("Error loading orders: " + error.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    logger.user.action("View Wishlist", { userId: user.uid });
  }, [user]);

  useEffect(() => {
    if (currentSection === 'orders' || currentSection === 'track-shipment') {
      fetchOrders();
    } else if (currentSection === 'wishlist') {
      fetchWishlist();
    }
  }, [currentSection, fetchOrders, fetchWishlist]);

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
        
        sessionStorage.setItem(`profile_${user.uid}`, JSON.stringify({
          profilePic: profile.profilePic || defaultPfp,
          name: profile.name || 'User'
        }));
        
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Error updating profile: " + error.message);
        console.error("Error updating profile:", error);
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    await removeWishlistItem(productId);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0.00';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '₹0.00';
    const parts = num.toFixed(2).split('.');
    const integer = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `₹${decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger}`;
  };

  const formatOrderDate = (date) => {
    if (!date) return 'N/A';
    const orderDate = new Date(date);
    if (isNaN(orderDate.getTime())) return 'Invalid date';
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

  const handleDownloadReceipt = async (order) => {
    try {
      toast.info('Preparing your receipt...');
      const orderCopy = { ...order };
      if (!orderCopy.totalAmount && !orderCopy.total) {
        const subtotal = orderCopy.subtotal || 0;
        const tax = orderCopy.tax || 0;
        const shipping = orderCopy.shipping?.cost || 0;
        const discount = orderCopy.discount || 0;
        const importDuty = orderCopy.importDuty || 0;
        orderCopy.totalAmount = subtotal + tax + shipping + importDuty - discount;
      }
      await downloadOrderReceipt(orderCopy);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt. Please try again.');
    }
  };

  const handleCopyTrackingCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Consignment ID copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-600 mb-4"></div>
        <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">Loading Account...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30 min-h-screen py-16">
      <Helmet>
        <title>My Account | KamiKoto</title>
        <meta name="description" content="Manage your KamiKoto account, view orders, and update your profile." />
      </Helmet>
      
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Account Dashboard</h1>
          <p className="text-gray-500 text-base mt-2">Manage your profile.</p>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden mb-8 overflow-x-auto scrollbar-hide bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-1.5">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'track-shipment', label: 'Tracking', icon: Truck },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'reviews', label: 'Reviews', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSection === tab.id;
            return (
              <Link
                key={tab.id}
                to={`/my-account/${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </Link>
            );
          })}
        </div>
        
        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Navigation - Desktop (col-span-3) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-8 sticky top-24">
              {/* Profile Avatar Card */}
              <div className="text-center pb-6 border-b border-gray-100">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                  <img
                    src={profile.profilePic || defaultPfp}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover border border-gray-100 shadow-md group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute -bottom-1 -right-1 p-2 bg-gray-900 text-white rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform">
                    <Camera size={14} />
                  </div>
                </div>
                <h3 className="font-extrabold text-lg text-gray-900 leading-snug">{profile.name || 'User'}</h3>
                <p className="text-xs text-gray-400 mt-1 truncate max-w-full">{profile.email}</p>
           
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Profile Settings', icon: User },
                  { id: 'orders', label: 'Order History', icon: ShoppingBag },
                  { id: 'track-shipment', label: 'Track Shipments', icon: Truck },
                  { id: 'wishlist', label: 'My Wishlist', icon: Heart },
                  { id: 'reviews', label: 'Product Reviews', icon: Star }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentSection === tab.id;
                  return (
                    <Link
                      key={tab.id}
                      to={`/my-account/${tab.id}`}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/10'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                        {tab.label}
                      </span>
                      <ChevronRight size={14} className={isActive ? 'text-white' : 'text-gray-300'} />
                    </Link>
                  );
                })}
              </nav>

              {/* Logout trigger */}
              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={() => auth.signOut()}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area (col-span-9) */}
          <div className="col-span-1 lg:col-span-9">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-3 py-6 sm:p-6 md:p-10 min-h-[500px]">
              <AnimatePresence mode="wait">
                <m.div
                  key={currentSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {/* PROFILE SETTINGS */}
                  {currentSection === 'profile' && (
                    <div className="space-y-10">
                      {/* Section Title */}
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Profile Settings</h2>
                        <p className="text-sm text-gray-400 mt-1">Manage your account information and default shipping addresses.</p>
                      </div>

                      {/* Header Section on Mobile (Displays avatar since sidebar is hidden) */}
                      <div className="lg:hidden flex items-center gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="relative w-16 h-16 group">
                          <img
                            src={profile.profilePic || defaultPfp}
                            alt="Profile"
                            className="w-16 h-16 rounded-xl object-cover border border-gray-150 shadow-sm"
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg text-gray-900 leading-snug">{profile.name || 'User'}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
                     
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info Card */}
                        <div className="bg-gray-50/30 rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100/50 space-y-6">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-cyan-600" />
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} required icon={User} className="bg-white border-gray-200 rounded-2xl" />
                            <Input label="Email Address" name="email" value={profile.email} disabled icon={AlertCircle} className="bg-gray-150 border-gray-200 rounded-2xl cursor-not-allowed" />
                            <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} icon={Truck} className="bg-white border-gray-200 rounded-2xl" />
                            <Input label="Profile Picture URL" name="profilePic" value={profile.profilePic} onChange={handleChange} icon={Camera} className="bg-white border-gray-200 rounded-2xl" />
                          </div>
                        </div>
                        
                        {/* Address Info Card */}
                        <div className="bg-gray-50/30 rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100/50 space-y-6">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin size={18} className="text-cyan-600" />
                            Default Shipping Address
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">House / Plot / Suite No.</label>
                              <input type="text" name="address.houseNo" value={profile.address.houseNo} onChange={handleChange} placeholder="e.g. 402-A" className="w-full p-4 border border-gray-200 rounded-2xl bg-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ZIP / Postal PIN Code</label>
                              <input type="text" name="address.pin" value={profile.address.pin} onChange={handleChange} placeholder="e.g. 400001" className="w-full p-4 border border-gray-200 rounded-2xl bg-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address Line 1 (Street name, locality)</label>
                              <input type="text" name="address.line1" value={profile.address.line1} onChange={handleChange} placeholder="e.g. Nariman Point, MG Road" className="w-full p-4 border border-gray-200 rounded-2xl bg-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">City</label>
                                <input type="text" name="address.city" value={profile.address.city} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full p-4 border border-gray-200 rounded-2xl bg-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                                <select name="address.country" value={profile.address.country} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-2xl bg-white text-sm focus:border-cyan-500 outline-none transition-all">
                                  {Object.keys(countriesStatesData.countries).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">State</label>
                                <select name="address.state" value={profile.address.state} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-2xl bg-white text-sm focus:border-cyan-500 outline-none transition-all">
                                  <option value="">Select State</option>
                                  {profile.address.country && countriesStatesData.countries[profile.address.country]?.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit" variant="primary" isLoading={saveLoading} loadingText="Updating..." className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3.5 rounded-2xl font-bold border-none transition-all">
                            Save Profile Changes
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ORDER HISTORY */}
                  {currentSection === 'orders' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Order History</h2>
                        <p className="text-sm text-gray-400 mt-1">Review all your past and pending KamiKoto collection orders.</p>
                      </div>

                      {ordersLoading ? (
                        <div className="flex justify-center py-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600"></div>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="bg-gray-50/50 rounded-3xl p-12 text-center border border-dashed border-gray-200 space-y-4">
                          <ShoppingBag size={40} className="mx-auto text-gray-300" />
                          <div>
                            <h3 className="font-extrabold text-lg text-gray-900">No orders placed yet</h3>
                            <p className="text-gray-400 text-xs mt-1">Explore our premium curation of Kamikoto essentials to start building your collective.</p>
                          </div>
                          <Link to="/products" className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                            Explore Catalog
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div key={order.id} className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                              {/* Order Card Header */}
                              <div className="bg-gray-50/50 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-6 text-xs flex-wrap">
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">DATE PLACED</p>
                                    <p className="font-semibold text-gray-900">{formatOrderDate(order.orderDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">ORDER ID</p>
                                    <p className="font-mono font-semibold text-gray-900 flex items-center gap-1.5">
                                      {order.orderId}
                                      <button onClick={() => { navigator.clipboard.writeText(order.orderId); toast.success('Order ID copied!'); }} className="text-gray-400 hover:text-gray-900">
                                        <Copy size={12} />
                                      </button>
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">STATUS</p>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ORDER_STATUS[order.status?.toUpperCase()]?.color || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => handleDownloadReceipt(order)} title="Download Invoice Receipt PDF" className="p-2.5 bg-white text-gray-600 rounded-xl border border-gray-150 hover:bg-cyan-600 hover:text-white hover:border-transparent transition-all">
                                  <FileDown size={16} />
                                </button>
                              </div>

                              {/* Order Card Body */}
                              <div className="p-4 sm:p-6 space-y-4 divide-y divide-gray-100">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-5 pt-4 first:pt-0">
                                    <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-xl border border-gray-100 p-1 flex-shrink-0" />
                                    <div className="flex-grow">
                                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                                      <p className="text-xs text-gray-400 mt-0.5">Quantity: {item.quantity} · Price: {formatPrice(item.price)}</p>
                                    </div>
                                    <p className="font-extrabold text-sm text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                  </div>
                                ))}
                                
                                {/* Order Card Footer */}
                                <div className="pt-5 border-t border-gray-100 flex flex-wrap justify-between items-end gap-4">
                                  <div className="flex gap-8 text-xs text-gray-400">
                                    {order.address && (
                                      <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">DELIVER TO</p>
                                        <p className="font-medium text-gray-700">{order.address.houseNo}, {order.address.line1}, {order.address.city}</p>
                                      </div>
                                    )}
                                    {order.paymentDetails && (
                                      <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">PAYMENT METHOD</p>
                                        <p className="font-medium text-gray-700">{order.paymentDetails.method || 'Online Payment'}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">GRAND TOTAL</p>
                                    <p className="text-2xl font-black text-cyan-600 tracking-tight">{formatPrice(order.totalAmount || order.total)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SHIPMENT TRACKING */}
                  {currentSection === 'track-shipment' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Consignment Tracking</h2>
                        <p className="text-sm text-gray-400 mt-1">Real-time parcel delivery tracking directly with our courier partners.</p>
                      </div>

                      {ordersLoading ? (
                        <div className="flex justify-center py-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600"></div>
                        </div>
                      ) : orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length === 0 ? (
                        <div className="bg-gray-50/50 rounded-3xl p-12 text-center border border-gray-150 space-y-4">
                          <Truck size={40} className="mx-auto text-gray-300 animate-pulse" />
                          <div>
                            <h3 className="font-extrabold text-lg text-gray-900">No active shipments</h3>
                            <p className="text-gray-400 text-xs mt-1">You currently have no orders that are processed and shipped for delivery.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').map((order) => (
                            <div key={order.id} className="border border-gray-100 rounded-3xl p-4 sm:p-6 md:p-8 bg-white shadow-sm space-y-6">
                              {/* Shipment Consignment info */}
                              <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-gray-100">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">INDIAPOST CONSIGNMENT NO</p>
                                  <h3 className="font-mono text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    {order.tracking?.code || 'EM123456789IN'}
                                    <button onClick={() => handleCopyTrackingCode(order.tracking?.code || 'EM123456789IN')} className="text-gray-400 hover:text-gray-900">
                                      <Copy size={14} />
                                    </button>
                                  </h3>
                                </div>
                                <a href="https://www.indiapost.gov.in" target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-gray-900 hover:bg-cyan-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                                  Go to Carrier Portal
                                </a>
                              </div>

                              {/* Shipment status timeline */}
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">DELIVERY STATUS TIMELINE</p>
                                <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                  
                                  {/* Step 1 */}
                                  <div className="flex gap-4 items-start relative">
                                    <div className="w-9 h-9 rounded-full bg-cyan-50 border-2 border-cyan-500 text-cyan-600 flex items-center justify-center font-bold z-10 flex-shrink-0">
                                      ✓
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-gray-900">Order Placed & Confirmed</h5>
                                      <p className="text-xs text-gray-400 mt-0.5">Your luxury collection request is recorded and processed.</p>
                                    </div>
                                  </div>

                                  {/* Step 2 */}
                                  <div className="flex gap-4 items-start relative">
                                    <div className="w-9 h-9 rounded-full bg-cyan-50 border-2 border-cyan-500 text-cyan-600 flex items-center justify-center font-bold z-10 flex-shrink-0">
                                      ✓
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-gray-900">Packed & Dispatched</h5>
                                      <p className="text-xs text-gray-400 mt-0.5">Order securely boxed in protective, custom brand packaging.</p>
                                    </div>
                                  </div>

                                  {/* Step 3 */}
                                  <div className="flex gap-4 items-start relative">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold z-10 flex-shrink-0 border-2 ${order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-cyan-50 border-cyan-500 text-cyan-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                                      {order.status === 'Shipped' || order.status === 'Delivered' ? '✓' : '3'}
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-gray-900">In Transit (Shipped)</h5>
                                      <p className="text-xs text-gray-400 mt-0.5">Handed over to India Post cargo hub for courier dispatch.</p>
                                    </div>
                                  </div>

                                  {/* Step 4 */}
                                  <div className="flex gap-4 items-start relative">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold z-10 flex-shrink-0 border-2 ${order.status === 'Delivered' ? 'bg-cyan-50 border-cyan-500 text-cyan-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                                      {order.status === 'Delivered' ? '✓' : '4'}
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-gray-900">Delivered</h5>
                                      <p className="text-xs text-gray-400 mt-0.5">Successfully signed for and delivered to default shipping address.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* WISHLIST SECTION */}
                  {currentSection === 'wishlist' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">My Wishlist</h2>
                        <p className="text-sm text-gray-400 mt-1">Review items you've bookmarked to add to your collection later.</p>
                      </div>

                      {wishlistHookLoading ? (
                        <div className="flex justify-center py-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600"></div>
                        </div>
                      ) : hookWishlistItems.length === 0 ? (
                        <div className="bg-gray-50/50 rounded-3xl p-12 text-center border border-dashed border-gray-200 space-y-4">
                          <Heart size={40} className="mx-auto text-gray-300" />
                          <div>
                            <h3 className="font-extrabold text-lg text-gray-900">Your wishlist is empty</h3>
                            <p className="text-gray-400 text-xs mt-1">Bookmark product listings to save premium finds inside this page.</p>
                          </div>
                          <Link to="/products" className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                            Explore Catalog
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {hookWishlistItems.map((item) => (
                            <div key={item.id} className="group bg-white rounded-2xl border border-gray-155 overflow-hidden hover:border-cyan-600 transition-all hover:shadow-md flex flex-col justify-between">
                              <div className="aspect-square relative overflow-hidden bg-gray-50/50 flex items-center justify-center p-3 sm:p-4">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                                <button onClick={() => handleRemoveFromWishlist(item.id)} title="Remove from Wishlist" className="absolute top-3 right-3 p-2 bg-white/95 rounded-xl text-gray-400 hover:text-red-600 shadow-sm border border-gray-100 hover:rotate-6 transition-all">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                              <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
                                <div className="mb-4">
                                  <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.category}</p>
                                </div>
                                <div className="space-y-4">
                                  <p className="text-lg font-black text-gray-900">{formatPrice(item.price)}</p>
                                  <Link to={`/product/${item.id}`} className="w-full inline-flex justify-center py-3 bg-gray-900 hover:bg-cyan-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all text-center">
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* USER REVIEWS SECTION */}
                  {currentSection === 'reviews' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Your Reviews</h2>
                        <p className="text-sm text-gray-400 mt-1">Review feedback and star ratings you have left for KamiKoto purchases.</p>
                      </div>

                      <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white p-4 sm:p-6 md:p-8">
                        <UserReviews />
                      </div>
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
