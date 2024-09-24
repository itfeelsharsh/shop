
import React from 'react';
import { motion } from 'framer-motion';


function AboutUs() {
  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: "easeInOut" }} 
    className="container mx-auto px-4 py-8 bg-gray-50"
  >
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-8 text-gray-900 text-center">About Us</h1>
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Welcome to <strong className="text-indigo-600">KamiKoto</strong>! We are passionate about bringing you the best of authentic Japanese stationery. Whether you're a student, a professional, or simply someone who loves beautifully designed and high-quality stationery, we have something for you.
      </p>
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Our goal is to bridge the gap between Japan’s traditional craftsmanship and modern stationery needs. We believe that the art of writing and organizing should be a pleasure, and every product we offer is carefully curated to enhance that experience.
      </p>
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        From exquisite pens and notebooks to planners and rare stationery items, we take pride in offering only the highest quality products straight from Japan. Each piece of stationery embodies the precision and beauty that Japan is renowned for.
      </p>
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Thank you for visiting our store. Whether you’re here for a specific item or to explore the world of Japanese stationery, we hope you find something that sparks joy in your everyday life!
      </p>
    </div>
    </motion.div>

  );
}

export default AboutUs;
