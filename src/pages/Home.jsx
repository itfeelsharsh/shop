import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import DynamicBanner from "../components/DynamicBanner";
import { useContentLoader } from "../hooks/useContentLoader";
import { ArrowRight, Zap, ShieldCheck, Globe } from "lucide-react";
import Button from "../components/Button";
import { Helmet } from "react-helmet-async";

/**
 * Peak 2020 Premium Home Page
 * 
 * Features a high-end minimalist design with glassmorphism, 
 * sophisticated typography, and smooth cinematic transitions.
 */
function Home() {
  const [products, setProducts] = useState([]);
  const [isLoadingFresh, setIsLoadingFresh] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { getCachedData, preloadedData } = useContentLoader();

  useEffect(() => {
    const initializeProducts = async () => {
      try {
        const cachedProducts = getCachedData('products');

        if (cachedProducts && cachedProducts.length > 0) {
          setProducts(cachedProducts);
          return;
        }

        setIsLoadingFresh(true);
        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            stock: data.stock !== undefined ? parseInt(data.stock, 10) : 0,
            price: data.price !== undefined ? parseFloat(data.price) : 0,
            mrp: data.mrp !== undefined ? parseFloat(data.mrp) : null
          };
        });

        const filteredProducts = productList.filter(product => product.showOnHome);
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error initializing products:", error);
        setProducts([]);
      } finally {
        setIsLoadingFresh(false);
      }
    };

    initializeProducts();
  }, [getCachedData]);

  useEffect(() => {
    const preloadedProducts = preloadedData?.products;
    if (preloadedProducts && preloadedProducts.length > 0 && products.length === 0) {
      setProducts(preloadedProducts);
    }
  }, [preloadedData, products.length]);

  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>KamiKoto | Premium Japanese Stationery & Writing Tools</title>
        <meta name="description" content="Discover the pinnacle of premium Japanese stationery. Engineered for precision, designed for inspiration. Shop our collection of notebooks, pens, and more." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] py-20 overflow-hidden flex items-center justify-center">
        {/* Dynamic Background Banner */}
        <div className="absolute inset-0 z-0">
          <DynamicBanner />
          <div className="absolute inset-0 bg-black/40 z-[1]" /> {/* Dark overlay for readability */}
        </div>
        
        {/* Glassmorphic Overlay Card */}
        <m.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl w-full mx-4"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[40px] p-8 md:p-16 text-center shadow-2xl">
            <m.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-[0.2em] text-white uppercase bg-black/20 backdrop-blur-md rounded-full"
            >
              New Collection
            </m.span>
            <m.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-tight"
            >
              Artistry in <br /> 
              <span className="text-white">Every Stroke.</span>
            </m.h1>
            <m.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-white mb-10 max-w-xl mx-auto font-medium"
            >
              Discover the pinnacle of premium Japanese stationery. Engineered for precision, designed for inspiration.
            </m.p>
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/products')}
                className="bg-white !text-black hover:bg-gray-100 border-none shadow-xl min-w-[200px]"
              >
                Shop Now
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => navigate('/about')}
                className="bg-white/10 !text-white border-white/30 backdrop-blur-md hover:bg-white/20 min-w-[200px]"
              >
                Our Story
              </Button>
            </m.div>
          </div>
        </m.div>
      </section>

      {/* Features Grid (Bento Style) */}
      <m.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-4 py-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <m.div variants={itemVariants} className="md:col-span-2 bg-gray-50 rounded-[32px] p-10 flex flex-col justify-between hover:bg-gray-100 transition-colors">
            <Zap className="w-12 h-12 text-black mb-12" />
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Precision Engineering</h3>
              <p className="text-gray-600">Every piece in our collection is selected for its mechanical excellence and tactile feedback.</p>
            </div>
          </m.div>
          
          <m.div variants={itemVariants} className="bg-black rounded-[32px] p-10 text-white flex flex-col justify-between hover:bg-gray-900 transition-colors">
            <ShieldCheck className="w-10 h-10 mb-8 text-white" />
            <div>
              <h4 className="text-xl font-bold mb-2 text-white">Lifetime Quality</h4>
              <p className="text-sm text-white font-medium">Built to last a lifetime of creative work.</p>
            </div>
          </m.div>
          
          <m.div variants={itemVariants} className="bg-blue-600 rounded-[32px] p-10 text-white flex flex-col justify-between hover:bg-blue-700 transition-colors">
            <Globe className="w-10 h-10 mb-8 text-white" />
            <div>
              <h4 className="text-xl font-bold mb-2 text-white">Global Sourcing</h4>
              <p className="text-sm text-white font-medium">Direct imports from Japan and Europe.</p>
            </div>
          </m.div>
        </div>
      </m.section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-5xl font-bold text-gray-900 tracking-tighter mb-4">The Essentials</h2>
            <p className="text-xl text-gray-500 max-w-lg">Core pieces of the KamiKoto collection, refined over generations for the modern creator.</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="text-lg font-bold group"
            icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
          >
            Explore Everything
          </Button>
        </m.div>

        {isLoadingFresh && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <m.div
                key={product.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </m.div>
            ))}
          </div>
        )}
      </section>

      {/* Brand Ethos / Video Section */}
      <m.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-24"
      >
        <div className="bg-gray-900 rounded-[48px] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=2070" 
            alt="Craftsmanship" 
            className="w-full h-[600px] object-cover transition-transform duration-[3s] group-hover:scale-110"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-12">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">Beyond Stationery.</h2>
            <p className="text-xl text-white/70 max-w-2xl mb-10">We believe that the tools you use define the quality of your output. We provide the tools; you provide the vision.</p>
            <Button
              variant="secondary"
              size="large"
              onClick={() => navigate('/about')}
              className="bg-white/10 backdrop-blur-xl border-white/20 !text-white hover:bg-white/20"
            >
              Watch the Film
            </Button>
          </div>
        </div>
      </m.section>

    </div>
  );
}

export default Home;
