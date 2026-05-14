
import React from 'react';
import { m } from "framer-motion";
import { Helmet } from 'react-helmet-async';
import { Truck, Zap, Globe, Shield } from 'lucide-react';

function ShippingInfo() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Processing",
      description: "Our systems process your test order at the speed of light. It's truly impressive for something that doesn't exist."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "We ship from Localhost to everywhere. As long as you have a WiFi connection, your order is technically already home."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Encrypted Transit",
      description: "Your imaginary parcel is protected by 256-bit AES encryption. Not even hackers can find your non-existent package."
    }
  ];

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white py-16 px-4"
    >
      <Helmet>
        <title>Shipping Information | KamiKoto</title>
        <meta name="description" content="Learn about our lightning-fast shipping to the edge of the internet." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black mb-6 text-gray-900 tracking-tighter uppercase italic">
            Shipping Info<span className="text-gray-300">.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Everything you need to know about how we (don't) move your premium stationery across the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, idx) => (
            <m.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </m.div>
          ))}
        </div>

        <div className="space-y-12 bg-gray-950 text-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

          <section>
            <h2 className="text-3xl font-black mb-6 flex items-center text-white">
              <Truck className="mr-4 text-white/50" /> Shipping Methods
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-white/10 p-6 rounded-2xl bg-white/5">
                <h4 className="font-bold text-xl mb-2 text-white">Standard Simulation</h4>
                <p className="text-sm text-white/80">Arrives in 3-5 milliseconds. Free for everyone, forever.</p>
              </div>
              <div className="border border-white/10 p-6 rounded-2xl bg-white/5">
                <h4 className="font-bold text-xl mb-2 text-white">Express Imagination</h4>
                <p className="text-sm text-white/80">Arrives before you even click. Powered by advanced predictive heuristics.</p>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-white/10">
            <h2 className="text-3xl font-black mb-6 text-white">Tracking Your Order</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Once you complete your test checkout, we provide a tracking number. This number is purely decorative. If you paste it into a search engine, you'll likely find a very confused Wikipedia page or a random string of hexadecimal code.
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-white text-gray-950 rounded-full font-black uppercase text-sm tracking-widest">
              Status: Always Delivered
            </div>
          </section>

          <div className="pt-10 text-center">
            <p className="text-xs text-white/40 uppercase font-bold tracking-[0.2em]">
              Disclaimer: KamiKoto is a portfolio piece. No physical shipping occurs.
            </p>
          </div>
        </div>
      </div>
    </m.div>
  );
}

export default ShippingInfo;
