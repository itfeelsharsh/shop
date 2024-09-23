import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
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
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
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
        } else {
          toast.warn("No profile data found. Please update your profile.");
        }
      }
    };
    fetchProfile();
  }, [user]);

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
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        profilePic: profile.profilePic
      });
      toast.success("Profile updated successfully!");
    }
  };



  return (
    <div className="container mx-auto p-8 bg-white shadow-2xl rounded-2xl max-w-2xl transition-all duration-300 ease-in-out">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-900">Your Profile</h1>

      {/* Profile Picture Section */}
      <div className="flex items-center mb-6">
        <img 
          src={profile.profilePic || 'https://via.placeholder.com/150'} 
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-gray-300 mr-4"
        />
        <input 
          type="text" 
          name="profilePic" 
          placeholder="Profile Picture URL" 
          value={profile.profilePic}
          onChange={handleChange}
          className="p-4 border border-gray-300 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <input 
          type="text" 
          name="name" 
          placeholder="Name" 
          value={profile.name}
          onChange={handleChange}
          required 
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={profile.email}
          onChange={handleChange}
          required 
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
          disabled
        />
        <input 
          type="text" 
          name="phone" 
          placeholder="Contact No" 
          value={profile.phone}
          onChange={handleChange}
          required 
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
        />
        
        <h2 className="text-2xl font-semibold text-gray-800">Address</h2>
        <input 
          type="text" 
          name="address.houseNo" 
          placeholder="House No" 
          value={profile.address.houseNo}
          onChange={handleChange}
          required 
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
        />
        <input 
          type="text" 
          name="address.line1" 
          placeholder="Line 1" 
          value={profile.address.line1}
          onChange={handleChange}
          required 
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
        />
        <input 
          type="text" 
          name="address.line2" 
          placeholder="Line 2" 
          value={profile.address.line2}
          onChange={handleChange}
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
        />
        <input 
          type="text" 
          name="address.pin" 
          placeholder="PIN Code" 
          value={profile.address.pin}
          onChange={handleChange}
          required 
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 shadow-md"
        />
        
        <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200">Save Changes</button>
      </form>



      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
    </div>
  );
}

export default Profile;