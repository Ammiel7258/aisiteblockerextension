// Content script that runs on every page - OPTIMIZED VERSION
(function() {
    'use strict';

    // Cache for blocked sites to avoid repeated file reads
    let blockedSitesCache = null;
    let cacheTimestamp = 0;
    const CACHE_DURATION = 30000; // 30 seconds cache

    // Function to extract domain from URL
    function getDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.toLowerCase();
        } catch (e) {
            return '';
        }
    }

    // Function to get root domain (removes www and other subdomains)
    function getRootDomain(hostname) {
        const parts = hostname.split('.');
        if (parts.length >= 2) {
            // Handle cases like www.example.com -> example.com
            // Or sub.example.com -> example.com
            return parts.slice(-2).join('.');
        }
        return hostname;
    }

    // Function to load blocked sites with caching
    async function loadBlockedSites() {
        const now = Date.now();
        
        // Return cached version if still valid
        if (blockedSitesCache && (now - cacheTimestamp) < CACHE_DURATION) {
            return blockedSitesCache;
        }

        try {
            const response = await fetch(chrome.runtime.getURL('text/blocked-sites.txt'));
            const blockedSitesText = await response.text();
            
            // Use Set for O(1) lookup instead of array includes()
            const blockedSites = new Set(
                blockedSitesText.split('\n')
                    .map(site => site.trim().toLowerCase())
                    .filter(site => site)
            );
            
            // Cache the result
            blockedSitesCache = blockedSites;
            cacheTimestamp = now;
            
            return blockedSites;
        } catch (error) {
            console.error('Error reading blocked sites:', error);
            return new Set();
        }
    }

    // Function to check if domain is blocked (optimized)
    async function isDomainBlocked(domain) {
        const blockedSites = await loadBlockedSites();
        const rootDomain = getRootDomain(domain);
        
        // Use Set.has() for O(1) lookup instead of array.includes()
        return blockedSites.has(domain) || blockedSites.has(rootDomain);
    }

    // Function to create and show overlay
    function showOverlay(blockedUrl) {
        // Create overlay iframe
        const overlay = document.createElement('iframe');
        overlay.src = chrome.runtime.getURL(`html/overlay.html?url=${encodeURIComponent(blockedUrl)}`);
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border: none;
            z-index: 2147483647;
            background: white;
        `;
        
        // Add overlay to page
        document.body.appendChild(overlay);
        
        // Prevent scrolling on the original page
        document.body.style.overflow = 'hidden';
        
        // Store reference to overlay for potential removal
        window.siteBlockerOverlay = overlay;
    }

    // Function to hide overlay
    function hideOverlay() {
        if (window.siteBlockerOverlay) {
            window.siteBlockerOverlay.remove();
            window.siteBlockerOverlay = null;
            document.body.style.overflow = '';
        }
    }

    // Function to block page load until check is complete
    async function blockPageLoad() {
        // Wait for document.body to exist
        if (!document.body) {
            await new Promise(resolve => {
                new MutationObserver((mutations, observer) => {
                    if (document.body) {
                        observer.disconnect();
                        resolve();
                    }
                }).observe(document.documentElement, {childList: true});
            });
        }

        // Create a blocking overlay that prevents interaction
        const blockingOverlay = document.createElement('div');
        blockingOverlay.id = 'site-blocker-loading';
        blockingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2147483646;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 18px;
        `;
        blockingOverlay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">🔍</div>
                <div>Checking site security...</div>
            </div>
        `;

        document.body.appendChild(blockingOverlay);
        return blockingOverlay;
    }

    // Function to remove blocking overlay
    function unblockPageLoad(blockingOverlay) {
        if (blockingOverlay && blockingOverlay.parentNode) {
            blockingOverlay.remove();
        }
    }

    // Main function to check and block if necessary (optimized)
    async function checkAndBlock() {
        const currentUrl = window.location.href;
        const domain = getDomain(currentUrl);
        
        if (!domain) return;
        
        // Block page load immediately
        const blockingOverlay = await blockPageLoad();
        
        try {
            const isBlocked = await isDomainBlocked(domain);
            
            if (isBlocked) {
                console.log(`Site blocked: ${domain}`);
                showOverlay(currentUrl);
            }
        } catch (error) {
            console.error('Error checking domain:', error);
        } finally {
            // Always remove blocking overlay
            unblockPageLoad(blockingOverlay);
        }
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'hideOverlay') {
            hideOverlay();
            sendResponse({success: true});
        }
    });

    // Check immediately when script loads
    checkAndBlock();

    // Also check when URL changes (for SPAs) - optimized
    let lastUrl = location.href;
    let urlCheckTimeout = null;
    
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            
            // Debounce URL changes to avoid excessive checks
            if (urlCheckTimeout) {
                clearTimeout(urlCheckTimeout);
            }
            
            urlCheckTimeout = setTimeout(() => {
                checkAndBlock();
            }, 100); // 100ms debounce
        }
    }).observe(document, {subtree: true, childList: true});

})(); 