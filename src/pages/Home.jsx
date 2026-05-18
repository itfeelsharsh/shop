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
      {/* Thin Premium Banner Section */}
      <section className="container mx-auto px-4 pt-6">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full h-[110px] sm:h-[180px] md:h-[260px] lg:h-[380px] rounded-2xl md:rounded-[32px] overflow-hidden shadow-md border border-gray-100"
        >
          <DynamicBanner />
          {/* Elegant premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none z-10" />
        </m.div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Our Best Sellers</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-lg">A curated selection of high-quality stationery tools, built for your daily creative work.</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="text-base font-bold group btn-shopify text-gray-900 hover:text-red-600"
            icon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />}
          >
            Shop All Products
          </Button>
        </m.div>

        {isLoadingFresh && products.length === 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-50 rounded-[24px] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
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

      {/* Brand Ethos Section */}
      <m.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16"
      >
        <div className="bg-gray-900 rounded-[32px] md:rounded-[48px] overflow-hidden relative group shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-10" />
          <img 
            src="https://cdn.kamikoto.click/home-banner.jpeg" 
            alt="Premium craftsmanship background" 
            className="w-full h-[350px] sm:h-[450px] md:h-[600px] object-cover transition-transform duration-[3s] group-hover:scale-105"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 sm:p-12">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tight">Scamming you since 2024, KamiKoto.</h2>
            <p className="text-sm sm:text-lg text-white/80 max-w-2xl mb-8 sm:mb-10 leading-relaxed font-medium">
              We have been scamming you since the year 2024, we have scammed around 5lakhs ruppees so far, thank you for your support.
            </p>
            <Button
              variant="secondary"
              size="large"
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              className="bg-white/10 backdrop-blur-xl border-white/20 !text-white hover:bg-white/20 btn-shopify"
            >
              Read Our Story
            </Button>
          </div>
        </div>
      </m.section>

    </div>
  );
}

export default Home;
