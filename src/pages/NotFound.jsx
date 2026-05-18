import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Button from '../components/Button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="container mx-auto px-4 py-24 text-center max-w-xl min-h-[60vh] flex flex-col justify-center items-center"
    >
      <Helmet>
        <title>404 - Page Not Found | KamiKoto</title>
      </Helmet>

      <h1 className="text-8xl font-black text-gray-200 mb-6 leading-none select-none">404</h1>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Page Not Found</h2>
      <p className="text-gray-500 text-base mb-8 leading-relaxed">
        The page you are looking for does not exist or has been moved. Let's get you back to the shop.
      </p>

      <div className="flex justify-center">
        <Button
          variant="primary"
          size="large"
          onClick={() => navigate('/')}
          className="px-8 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md border-none"
        >
          Return to Home
        </Button>
      </div>
    </m.div>
  );
}

export default NotFound;
