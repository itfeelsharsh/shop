// This optional code is used to register a service worker.
// register() is not called by default.

// Note: This service worker implementation has been modified to disable all caching.
// It will still provide basic PWA functionality but without any offline capabilities.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Register the service worker for PWA functionality (without caching)
 * @param {Object} config - Configuration options for service worker
 */
export function register(config) {
  // Only register service worker in production environment and if browser supports it
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    
    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used.
    if (publicUrl.origin !== window.location.origin) {
      console.log('Service worker not registered - different origin between PUBLIC_URL and page');
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app has service worker enabled but caching is disabled'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  } else {
    console.log('Service worker not registered - not in production or browser does not support it');
  }
}

/**
 * Register a valid service worker
 * @param {string} swUrl - URL of the service worker
 * @param {Object} config - Configuration options
 */
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Successfully registered service worker
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated service worker is installed
              console.log(
                'New service worker version is installed - caching is disabled'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, new service worker is active
              console.log('Service worker installed - caching is disabled');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

/**
 * Check if a service worker is valid and not stale
 * @param {string} swUrl - URL of the service worker
 * @param {Object} config - Configuration options
 */
function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we get the expected response
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running without caching.');
    });
}

/**
 * Unregister the service worker
 * This can be used if PWA functionality needs to be disabled
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
} 