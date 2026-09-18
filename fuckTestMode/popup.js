document.addEventListener('DOMContentLoaded', () => {
    const enableToggle = document.getElementById('enableToggle');
    const backdropToggle = document.getElementById('backdropToggle');
    const statusBadge = document.getElementById('statusBadge');
    const blockedCount = document.getElementById('blockedCount');

    const storageApi = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync)
        ? chrome.storage.sync
        : (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ? chrome.storage.local : null);

    function updateBadge(enabled) {
        if (enabled) {
            statusBadge.textContent = 'Active';
            statusBadge.className = 'status-badge active';
        } else {
            statusBadge.textContent = 'Disabled';
            statusBadge.className = 'status-badge inactive';
        }
    }

    // Load stored settings
    if (storageApi) {
        storageApi.get(['enabled', 'hideBackdrop'], (res) => {
            const enabled = res.enabled !== false;
            const hideBackdrop = !!res.hideBackdrop;
            enableToggle.checked = enabled;
            backdropToggle.checked = hideBackdrop;
            updateBadge(enabled);
        });
    }

    // Query active tab to fetch stats
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Content script might not be injected on some pages (e.g., chrome://)
                        return;
                    }
                    if (response && response.removedCount !== undefined) {
                        blockedCount.textContent = response.removedCount;
                    }
                });
            }
        });
    }

    function saveAndNotify() {
        const enabled = enableToggle.checked;
        const hideBackdrop = backdropToggle.checked;

        updateBadge(enabled);

        if (storageApi) {
            storageApi.set({ enabled, hideBackdrop });
        }

        // Send message to active tab
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { action: 'updateSettings', enabled, hideBackdrop },
                        (response) => {
                            if (!chrome.runtime.lastError && response && response.removedCount !== undefined) {
                                blockedCount.textContent = response.removedCount;
                            }
                        }
                    );
                }
            });
        }
    }

    enableToggle.addEventListener('change', saveAndNotify);
    backdropToggle.addEventListener('change', saveAndNotify);
});
