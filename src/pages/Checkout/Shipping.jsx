import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import countriesStatesData from '../../../src/countriesStates.json'; 

function CheckoutShipping() {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [address, setAddress] = useState({
    houseNo: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    pin: ''
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().address) {
            setAddress(userDoc.data().address);
          }
        } catch (error) {
          console.error("Error fetching user address:", error);
        }
      }
    };
    fetchAddress();
  }, [user]);

  const handleStateChange = (e) => {
    setAddress(prev => ({ ...prev, state: e.target.value }));
  };

  const handleCountryChange = (e) => {
    setAddress(prev => ({ ...prev, country: e.target.value, state: '' })); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { address });
        navigate('/checkout/payment');
      } catch (error) {
        console.error("Error updating address:", error);
        alert("There was an error processing your request. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("You need to be signed in to proceed.");
    }
  };

  if (loadingAuth) return <div className="text-center">Loading...</div>;
  if (errorAuth) return <div className="text-red-500 text-center">{errorAuth.message}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-xl p-10 max-w-md w-full border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shipping Details</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {['houseNo', 'line1', 'line2', 'city', 'pin'].map((field, index) => (
            <input 
              key={index}
              type="text"
              placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              value={address[field]}
              onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm hover:shadow-md"
            />
          ))}
          
          <select 
            value={address.country} 
            onChange={handleCountryChange} 
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm hover:shadow-md"
            required
          >
            {Object.keys(countriesStatesData.countries).map((country, index) => (
              <option key={index} value={country}>{country}</option>
            ))}
          </select>

          <select 
            value={address.state} 
            onChange={handleStateChange} 
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm hover:shadow-md"
            required
          >
            <option value="" disabled>Select State</option>
            {countriesStatesData.countries[address.country].map((state, index) => (
              <option key={index} value={state}>{state}</option>
            ))}
          </select>
          
          <button 
            type="submit" 
            className={`mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutShipping;
