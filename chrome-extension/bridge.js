/**
 * JW Sales Command — Bridge Script
 * RUNS IN THE MAIN WORLD (LinkedIn's direct context)
 * 
 * Intercepts Voyager API calls and sends them to the Content Script
 */

(function() {
  console.log('[JW-Scout-Bridge] 🚀 Injecting Voyager Interceptor...');

  const notifyContentScript = (json, url) => {
    window.postMessage({
      source: 'jw-scout-bridge',
      type: 'VOYAGER_DATA',
      url: url,
      data: json
    }, '*');
  };

  // 1. Hook XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends OriginalXHR {
    constructor() {
      super();
      this._url = '';
      this.addEventListener('load', () => {
        if (this._url.includes('/voyager/api/') && 
           (this._url.includes('profileViewers') || this._url.includes('profile-views') || this._url.includes('analyticsFor') || this._url.includes('recruiter-views'))) {
          try {
            const json = JSON.parse(this.responseText);
            notifyContentScript(json, this._url);
          } catch (e) {}
        }
      });
    }
    open(method, url, ...args) {
      this._url = url;
      super.open(method, url, ...args);
    }
  };

  // 2. Hook Fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    
    if (url.includes('/voyager/api/') && 
       (url.includes('profileViewers') || url.includes('profile-views') || url.includes('analyticsFor') || url.includes('recruiter-views'))) {
      const clone = response.clone();
      clone.json().then(json => notifyContentScript(json, url)).catch(() => {});
    }
    return response;
  };

  console.log('[JW-Scout-Bridge] ✅ Interceptor Active.');
})();
