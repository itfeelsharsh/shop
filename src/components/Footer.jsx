import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-8 py-6">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold">KamiKoto</h3>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-6 mb-4">
          <Link to="/about" className="hover:text-indigo-400 transition duration-150 mb-2 md:mb-0">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-indigo-400 transition duration-150 mb-2 md:mb-0">
            Contact
          </Link>
          <Link to="/privacy-policy" className="hover:text-indigo-400 transition duration-150 mb-2 md:mb-0">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="hover:text-indigo-400 transition duration-150 mb-2 md:mb-0">
            Terms of Service
          </Link>
        </div>
        <div className="text-sm text-center">
          © {new Date().getFullYear()} KamiKoto. No rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
