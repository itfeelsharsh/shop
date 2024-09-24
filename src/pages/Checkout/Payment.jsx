import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 
import { useAuthState } from 'react-firebase-hooks/auth';

function CheckoutPayment() {
  const [user] = useAuthState(auth);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [card, setCard] = useState({ number: '', cvv: '', expiry: '', type: 'RuPay' });
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userRef);
        if (userDocSnapshot.exists()) {
          const userDoc = userDocSnapshot.data();
          const savedMethods = userDoc.paymentMethods || [];

          const cardMethod = savedMethods.find(method => method.cardNumber);
          const upiMethod = savedMethods.find(method => method.upi);

          if (cardMethod) {
            setCard({
              number: cardMethod.cardNumber,
              cvv: cardMethod.cvv,
              expiry: cardMethod.expiry,
              type: cardMethod.type,
            });
            setPaymentMethod('Card');
          } else if (upiMethod) {
            setUpi(upiMethod.upi);
            setPaymentMethod('UPI');
          }
        }
      }
    };
    fetchPaymentMethods();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
        setLoading(true);
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
                const cardNumber = card.number.trim();
                const cvv = card.cvv.trim();
                const expiry = card.expiry.trim();
                const cardType = card.type.trim();

                if (!/^\d{12,}$/.test(cardNumber)) {
                    alert("Invalid card number. It should have at least 12 digits.");
                    return;
                }

                if (!/^\d{3,4}$/.test(cvv)) {
                    alert("Invalid CVV. It should be 3 or 4 digits.");
                    return;
                }

                if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) {
                    alert("Invalid expiry date. Format should be MM/YY.");
                    return;
                }

                paymentData.push({ cardNumber, cvv, expiry, type: cardType });
            } else { 
                const trimmedUpi = upi.trim();

                if (!/@/.test(trimmedUpi)) {
                    alert("Invalid UPI ID. It should contain '@'.");
                    return;
                }

                paymentData.push({ upi: trimmedUpi });
            }

            await updateDoc(userRef, { paymentMethods: paymentData });
            console.log("Payment methods updated successfully.");

            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
            window.location.href = '/'; 

        } catch (error) {
            console.error("Error processing payment:", error);
            alert("There was an error processing your payment. Please try again.");
        } finally {
            setLoading(false);
        }
    } else {
        console.warn("User not authenticated.");
        alert("You need to be signed in to proceed.");
    }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Secure Payment</h1>
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
                onChange={(e) => setCard({ ...card, number: e.target.value })} 
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
          <button 
            type="submit" 
            className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPayment;
