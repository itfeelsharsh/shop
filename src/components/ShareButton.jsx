import React, { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Twitter, Facebook } from 'lucide-react';
import { toast } from 'react-toastify';

function ShareButton({ product, className = '' }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const url = (typeof window !== 'undefined' && window.location.href) || `${window?.location?.origin || ''}/products/${product?.id}`;
  const title = product?.name || 'Product';

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: product?.description?.slice(0, 120),
          url,
        });
      } catch (err) {
        // Do not open the fallback menu when the native share dialog closes (user cancel or native behavior).
        // Log real errors for diagnostics but keep UI quiet to avoid double menus.
        console.debug('Native share error or cancelled:', err);
      }
      return;
    }

    setOpen((s) => !s);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      setOpen(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const encoded = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} — ${product?.description?.slice(0, 100) || ''}`);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={handleShare}
        aria-label="Share product"
        className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-gray-50 hover:bg-gray-100 border-none shadow-sm text-gray-700 focus:outline-none"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-100 shadow-lg p-2 z-50">
          <button onClick={handleCopy} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 focus:outline-none">
            <Copy className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-800">Copy link</span>
          </button>

          <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encoded}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
            <Twitter className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-gray-800">Share on Twitter</span>
          </a>

          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
            <Facebook className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">Share on Facebook</span>
          </a>

          <a href={`https://wa.me/?text=${encodedText}%20${encoded}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.88 11.88 0 0012 0C5.37 0 .08 5.29.08 11.92c0 2.09.55 4.13 1.6 5.92L0 24l6.25-1.62A11.9 11.9 0 0012 23.84c6.63 0 11.92-5.29 11.92-11.92 0-3.19-1.24-6.18-3.4-8.44zM12 21.84c-1.7 0-3.36-.44-4.82-1.28l-.35-.21-3.71.96.99-3.62-.23-.37A8.92 8.92 0 013.08 11.92C3.08 6.35 7.43 2 13 2c2.4 0 4.6.92 6.29 2.59A8.9 8.9 0 0120.92 11.9c0 4.57-4.35 8-8.92 8z"/></svg>
            <span className="text-sm font-medium text-gray-800">Share on WhatsApp</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default ShareButton;
