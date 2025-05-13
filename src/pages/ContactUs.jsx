
import React from 'react';
import { m } from "framer-motion";


function ContactUs() {
  return (
    <m.div
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: "easeInOut" }} 
    className="container mx-auto px-4 py-8 bg-gray-50"
  >
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-8 text-gray-900 text-center">Contact Us</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        Have any questions, feedback, or just want to say hello? Feel free to reach out to us using the form below, and we’ll get back to you as soon as possible!
      </p>

      <form className="max-w-lg mx-auto space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-gray-700 mb-2 font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 mb-2 font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="5"
            required
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-500 transition duration-150">
          Send Message
        </button>
      </form>
    </div>
    </m.div>

  );
}

export default ContactUs;
