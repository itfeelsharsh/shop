
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../components/Button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Helmet>
        <title>404 - Page Not Found | KamiKoto</title>
        <meta name="description" content="Oops! The page you're looking for doesn't exist. Let's get you back on track." />
      </Helmet>

      <div className="max-w-2xl w-full text-center">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          <h1 className="text-[15rem] font-black text-gray-100 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <m.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Search size={120} className="text-gray-900" strokeWidth={1} />
            </m.div>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">
            Lost in the simulation<span className="text-gray-400">.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The page you're looking for has vanished into digital dust. Don't worry, even the best creatives get lost sometimes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/')}
              icon={<Home size={20} />}
            >
              Back to Reality
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => navigate(-1)}
              icon={<ArrowLeft size={20} />}
            >
              Go Back
            </Button>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 pt-10 border-t border-gray-100"
        >
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-bold">
            KamiKoto Premium Stationery
          </p>
        </m.div>
      </div>
    </div>
  );
}

export default NotFound;
