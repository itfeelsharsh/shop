import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import { Star, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.currentUser);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          setActiveImage(productData.image);
        } else {
          toast.error("Product not found!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("An error occurred while fetching the product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("You must be logged in to add items to your cart.");
      return;
    }
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
    toast.success("Product added to cart!");
  };

  const formatPrice = (price) => {
    const priceStr = price.toString();
    const [integerPart, decimalPart] = priceStr.split('.');

    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits ? "," : "") + lastThreeDigits;

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const handleImageClick = (image) => {
    setActiveImage(image);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/products" className="text-blue-600 hover:underline">Return to Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Products
        </Link>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Product Images Section */}
            <div className="lg:w-1/2 p-4">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex mt-4 space-x-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt="Thumbnail 1"
                    onClick={() => handleImageClick(product.image)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${activeImage === product.image ? 'border-blue-500' : 'border-gray-300'}`}
                  />
                )}
                {product.image2 && (
                  <img
                    src={product.image2}
                    alt="Thumbnail 2"
                    onClick={() => handleImageClick(product.image2)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${activeImage === product.image2 ? 'border-blue-500' : 'border-gray-300'}`}
                  />
                )}
                {product.image3 && (
                  <img
                    src={product.image3}
                    alt="Thumbnail 3"
                    onClick={() => handleImageClick(product.image3)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${activeImage === product.image3 ? 'border-blue-500' : 'border-gray-300'}`}
                  />
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="lg:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="text-yellow-400 fill-current" size={24} />
                  ))}
                  <span className="ml-2 text-gray-600">(4.5 / 5)</span>
                </div>
                <p className="text-lg text-gray-700 mb-6">{product.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">₹{formatPrice(product.price)}</span>
                  {product.oldPrice && (
                    <span className="ml-4 text-xl text-gray-500 line-through">
                      ₹{formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {loading ? "Processing..." : "Add to Cart"}
                </button>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Truck className="mr-2" size={20} />
                    <span>Free shipping on orders over ₹500</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <ShieldCheck className="mr-2" size={20} />
                    <span>1 year warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
    </div>
  );
}

export default ProductView;
