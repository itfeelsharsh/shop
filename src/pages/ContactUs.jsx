import React from 'react';
import { Helmet } from 'react-helmet-async';
import InfoPageLayout from '../components/InfoPageLayout';

function ContactUs() {
  return (
    <>
      <Helmet>
        <title>Contact Us | KamiKoto</title>
        <meta name="description" content="Contact KamiKoto with questions, feedback, or support requests." />
      </Helmet>

      <InfoPageLayout
        category="Support"
        title="Contact Us"
        description="Have a question or feedback? Send us a message and we’ll get back to you as soon as possible."
      >
        <form className="mx-auto max-w-xl space-y-5 rounded-xl border border-gray-200 bg-gray-50/70 p-5 sm:p-7">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#D32F2F] focus:ring-4 focus:ring-red-100"
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-900">Subject</label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#D32F2F] focus:ring-4 focus:ring-red-100"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900">Message</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#D32F2F] focus:ring-4 focus:ring-red-100"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#D32F2F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B71C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2"
          >
            Send Message
          </button>
        </form>
      </InfoPageLayout>
    </>
  );
}

export default ContactUs;
