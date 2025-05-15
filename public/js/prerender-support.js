/**
 * Prerender Support Script
 * 
 * This script helps prerendering services (like Prerender.io)
 * detect when the page is fully loaded and ready for capture.
 * The prerenderReady flag will be set to true when the React
 * application is fully rendered.
 */

// Initialize the prerender ready flag to false
// It will be set to true when the application is fully loaded
window.prerenderReady = false; 