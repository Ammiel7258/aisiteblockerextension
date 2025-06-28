// Overlay logic moved from overlay.html for CSP compliance
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const blockedUrl = urlParams.get('url') || 'Unknown site';
    const blockedUrlElem = document.getElementById('blocked-url');
    if (blockedUrlElem) blockedUrlElem.textContent = blockedUrl;
    const goBackBtn = document.getElementById('go-back');
    if (goBackBtn) {
        goBackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.history.back();
        });
    }
}); 