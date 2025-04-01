import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import { Truck, ShieldCheck, ArrowLeft, Package2, ShoppingCart } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
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
          
          // After fetching the product, fetch similar products
          await fetchSimilarProducts(productData);
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
    
    /**
     * Fetches products that are similar to the current product based on category or brand
     * @param {Object} currentProduct - The product to find similar products for
     */
    const fetchSimilarProducts = async (currentProduct) => {
      try {
        setLoadingSimilar(true);
        
        // Query products with the same category/type
        const productsRef = collection(db, "products");
        const typeQuery = query(
          productsRef, 
          where("type", "==", currentProduct.type),
          limit(5)
        );
        
        const querySnapshot = await getDocs(typeQuery);
        const similarProductsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Filter out the current product
          .filter(prod => prod.id !== currentProduct.id);
          
        setSimilarProducts(similarProductsData);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoadingSimilar(false);
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

  /**
   * Handles adding a similar product to cart
   * @param {Object} product - The product to add to cart
   */
  const handleAddSimilarToCart = (product) => {
    if (!user) {
      toast.error("You must be logged in to add items to your cart.");
      return;
    }
    dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
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
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-12">
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
                {product.type && (
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {product.type}
                    </span>
                  </div>
                )}
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
                    <span>Free shipping on orders over ₹1,000 across India</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <ShieldCheck className="mr-2" size={20} />
                    <span>Warranty as per the manufacturer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-16 mb-12">
            <div className="flex items-center mb-8">
              <Package2 className="mr-3 text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
            </div>
            
            {loadingSimilar ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map(similarProduct => (
                  <div 
                    key={similarProduct.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
                  >
                    {/* Product Image */}
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={similarProduct.image || '/placeholder-image.jpg'} 
                        alt={similarProduct.name} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{similarProduct.name}</h3>
                      
                      {similarProduct.type && (
                        <div className="mt-1 mb-2">
                          <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {similarProduct.type}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
                        {similarProduct.description}
                      </p>
                      
                      <div className="flex items-baseline mb-4">
                        <span className="text-xl font-bold text-blue-600">
                          ₹{formatPrice(similarProduct.price)}
                        </span>
                        {similarProduct.originalPrice > similarProduct.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ₹{formatPrice(similarProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/product/${similarProduct.id}`} 
                          className="flex-grow bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                        >
                          View Product
                        </Link>
                        <button
                          onClick={() => handleAddSimilarToCart(similarProduct)}
                          className="p-2 bg-gray-100 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
    </div>
  );
}

export default ProductView;
