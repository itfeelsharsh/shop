/**
 * Razorpay Test Mode Ribbon Remover
 * 
 * Permanently and completely suppresses and purges the Razorpay "Test Mode"
 * top-right red diagonal ribbon badge with zero visual flicker.
 * Uses a dual-stage removal mechanism:
 * 1. Targeted CSS suppression
 * 2. Real-time DOM purge via MutationObserver
 */

function isTestModeRibbon(el) {
  if (!el || el.nodeType !== 1) return false;

  const normalizedText = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const isTestModeText = normalizedText.includes('test mode');

  // Check if inside backdrop
  const parentBackdrop = el.closest ? el.closest('.razorpay-backdrop') : null;
  if (parentBackdrop && (el.tagName === 'SPAN' || isTestModeText)) {
    return true;
  }

  // Check inline style indicators
  const style = el.getAttribute('style') || '';
  if (
    isTestModeText &&
    (style.includes('rotate(45deg)') ||
      style.includes('214, 68, 68') ||
      style.includes('#d64444') ||
      style.includes('dashed'))
  ) {
    return true;
  }

  // Direct span inside razorpay-backdrop
  if (
    el.parentElement &&
    el.parentElement.classList &&
    el.parentElement.classList.contains('razorpay-backdrop') &&
    el.tagName === 'SPAN'
  ) {
    return true;
  }

  return false;
}

export function sweepRazorpayTestModeRibbon(root = typeof document !== 'undefined' ? document : null) {
  if (!root || typeof document === 'undefined') return;

  // 1. Target known Razorpay backdrop selectors
  const selectors = [
    '.razorpay-backdrop > span',
    '.razorpay-backdrop span',
    '.razorpay-container .razorpay-backdrop span',
    'div.razorpay-backdrop > span',
    'div.razorpay-backdrop span',
  ];

  selectors.forEach((sel) => {
    try {
      const elements = root.querySelectorAll ? root.querySelectorAll(sel) : [];
      elements.forEach((el) => {
        el.remove();
      });
    } catch (e) {}
  });

  // 2. Scan all elements inside razorpay containers with "Test Mode" signatures
  try {
    const containers = root.querySelectorAll
      ? root.querySelectorAll('.razorpay-container, .razorpay-backdrop')
      : [];
    containers.forEach((container) => {
      const spans = container.querySelectorAll('span, div');
      spans.forEach((el) => {
        if (isTestModeRibbon(el)) {
          el.remove();
        }
      });
    });
  } catch (e) {}
}

let observer = null;

export function initRazorpayTestModeRemover() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Run immediate sweep
  sweepRazorpayTestModeRibbon(document);

  if (observer) return;

  try {
    observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.type === 'childList') {
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const node = mutation.addedNodes[j];
            if (node && node.nodeType === 1) {
              if (isTestModeRibbon(node)) {
                node.remove();
              } else {
                sweepRazorpayTestModeRibbon(node);
              }
            }
          }
        }
      }
    });

    const target = document.documentElement || document.body;
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true,
      });
    }
  } catch (err) {
    console.warn('Razorpay test mode remover observer init failed:', err);
  }
}
