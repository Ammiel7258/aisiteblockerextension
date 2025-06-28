// Background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Site Blocker Extension installed');
});

// Handle extension icon click (optional - for future features)
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked');
    // Could add popup or options here in the future
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getBlockedSites') {
        // This could be used to get blocked sites list
        sendResponse({success: true});
    }
}); 