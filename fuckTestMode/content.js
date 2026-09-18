(() => {
    'use strict';

    let settings = {
        enabled: true,
        hideBackdrop: false
    };

    let removedCount = 0;
    let observer = null;

    // Load initial settings
    const storageApi = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) 
        ? chrome.storage.sync 
        : (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ? chrome.storage.local : null);

    function initSettings(callback) {
        if (!storageApi) {
            if (callback) callback();
            return;
        }
        storageApi.get(['enabled', 'hideBackdrop'], (res) => {
            if (res.enabled !== undefined) settings.enabled = res.enabled;
            if (res.hideBackdrop !== undefined) settings.hideBackdrop = res.hideBackdrop;
            applyBackdropClass();
            if (callback) callback();
        });
    }

    function applyBackdropClass() {
        if (!document.documentElement) return;
        if (settings.enabled && settings.hideBackdrop) {
            document.documentElement.classList.add('hide-rzp-backdrop');
        } else {
            document.documentElement.classList.remove('hide-rzp-backdrop');
        }
    }

    // Check if element is a Razorpay Test Mode ribbon
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
        if (isTestModeText && (style.includes('rotate(45deg)') || style.includes('214, 68, 68') || style.includes('#d64444'))) {
            return true;
        }

        // Direct span inside razorpay-backdrop
        if (el.parentElement && el.parentElement.classList && el.parentElement.classList.contains('razorpay-backdrop') && el.tagName === 'SPAN') {
            return true;
        }

        return false;
    }

    // Thorough sweep to remove ribbons
    function sweepRibbons(root = document) {
        if (!settings.enabled || !root) return;

        // 1. Target known selectors
        const selectors = [
            '.razorpay-backdrop > span',
            '.razorpay-backdrop span',
            '.razorpay-container .razorpay-backdrop span'
        ];

        selectors.forEach((sel) => {
            try {
                const elements = root.querySelectorAll(sel);
                elements.forEach((el) => {
                    el.remove();
                    removedCount++;
                });
            } catch (e) {}
        });

        // 2. Scan all elements with "Test Mode" text in case classes vary
        try {
            const containers = root.querySelectorAll ? root.querySelectorAll('.razorpay-container, .razorpay-backdrop') : [];
            containers.forEach((container) => {
                const spans = container.querySelectorAll('span, div');
                spans.forEach((el) => {
                    if (isTestModeRibbon(el)) {
                        el.remove();
                        removedCount++;
                    }
                });
            });
        } catch (e) {}
    }

    // Set up MutationObserver to catch ribbons the moment they are inserted
    function startObserver() {
        if (observer) observer.disconnect();
        if (!settings.enabled) return;

        observer = new MutationObserver((mutations) => {
            if (!settings.enabled) return;

            for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];
                if (mutation.type === 'childList') {
                    for (let j = 0; j < mutation.addedNodes.length; j++) {
                        const node = mutation.addedNodes[j];
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            if (isTestModeRibbon(node)) {
                                node.remove();
                                removedCount++;
                            } else {
                                sweepRibbons(node);
                            }
                        }
                    }
                }
            }
        });

        const target = document.documentElement || document;
        observer.observe(target, {
            childList: true,
            subtree: true
        });
    }

    // Message listener for popup
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'getStatus') {
                sendResponse({
                    enabled: settings.enabled,
                    hideBackdrop: settings.hideBackdrop,
                    removedCount: removedCount
                });
            } else if (request.action === 'updateSettings') {
                settings.enabled = !!request.enabled;
                settings.hideBackdrop = !!request.hideBackdrop;
                applyBackdropClass();
                if (settings.enabled) {
                    sweepRibbons(document);
                    startObserver();
                } else {
                    if (observer) observer.disconnect();
                }
                sendResponse({ success: true, removedCount: removedCount });
            }
            return true;
        });
    }

    // Initialize immediately
    initSettings(() => {
        applyBackdropClass();
        if (settings.enabled) {
            sweepRibbons(document);
            startObserver();
        }
    });

    // Run sweep on document ready states
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            sweepRibbons(document);
        });
    } else {
        sweepRibbons(document);
    }

    window.addEventListener('load', () => {
        sweepRibbons(document);
    });

})();
