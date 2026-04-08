/**
 * JW Sales Command — LinkedIn Signal Scraper v2
 * Target: https://www.linkedin.com/analytics/profile-views/
 *
 * Strategy:
 *   1. Intercept LinkedIn's own Voyager API calls (XHR hooking) to get clean JSON
 *   2. Fall back to DOM scraping if the XHR hook misses anything
 *   3. Filter junk signals with the exclusion list before sending
 */

const EXCLUSION_PATTERNS = [
  /^LinkedIn Member$/i,
  /^Anonymous Visitor$/i,
  /recruiters?$/i,
  /found you through/i,
  /senior leaders? who share/i,
  /connections? who may be hiring/i,
  /open roles? you may be interested in/i,
  /View the full details/i,
  /^\d+ (work at|are|have)/i,
  /^Manage settings$/i,
];

const PROCESSED_IDS = new Set();

function isJunk(name) {
  if (!name || name.length === 0) return true;
  return EXCLUSION_PATTERNS.some(pattern => pattern.test(name));
}

function parseVoyagerViewer(viewer) {
  try {
    // LinkedIn's Voyager API returns deeply nested objects — these paths
    // are stable as of 2025 for the profileViewers endpoint
    const name = viewer?.name?.text
      || viewer?.memberDistance?.localizedFirstName + ' ' + viewer?.memberDistance?.localizedLastName
      || viewer?.memberInfo?.memberName
      || null;

    const headline = viewer?.occupation
      || viewer?.memberInfo?.memberHeadlineText
      || viewer?.headline?.text
      || null;

    // Parse title and company from headline (e.g. "Software Engineer at Google")
    let title = null, company = null;
    if (headline) {
      const atIdx = headline.lastIndexOf(' at ');
      if (atIdx > -1) {
        title = headline.substring(0, atIdx).trim();
        company = headline.substring(atIdx + 4).trim();
      } else {
        title = headline;
      }
    }

    const profileUrl = viewer?.navigationUrl
      || viewer?.memberInfo?.publicIdentifier
        ? `https://www.linkedin.com/in/${viewer?.memberInfo?.publicIdentifier}`
        : null;

    const photo = viewer?.profilePicture?.displayImageReference?.vectorImage?.artifacts?.[0]?.fileIdentifyingUrlPathSegment
      ? `https://media.licdn.com/dms/image/${viewer?.profilePicture?.displayImageReference?.vectorImage?.rootUrl || ''}${viewer?.profilePicture?.displayImageReference?.vectorImage?.artifacts?.[0]?.fileIdentifyingUrlPathSegment}`
      : null;

    const viewedAt = viewer?.lastViewedAt
      || viewer?.viewedAt
      || viewer?.createdAt
      || new Date().toISOString();

    return { name, title, company, profileUrl, photo, viewedAt };
  } catch (e) {
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRATEGY 1: Hook XMLHttpRequest to intercept Voyager API calls
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const OriginalXHR = window.XMLHttpRequest;

class InterceptedXHR extends OriginalXHR {
  constructor() {
    super();
    this._url = '';
    this.addEventListener('load', () => {
      if (
        this._url.includes('/voyager/api/') &&
        (this._url.includes('profileViewers') || this._url.includes('profile-views') || this._url.includes('analyticsFor'))
      ) {
        try {
          const json = JSON.parse(this.responseText);
          handleVoyagerResponse(json, this._url);
        } catch (_) {}
      }
    });
  }
  open(method, url, ...args) {
    this._url = url;
    super.open(method, url, ...args);
  }
}

window.XMLHttpRequest = InterceptedXHR;

// Also hook fetch() for newer LinkedIn API calls
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch(...args);
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
  if (
    url.includes('/voyager/api/') &&
    (url.includes('profileViewers') || url.includes('profile-views') || url.includes('analyticsFor'))
  ) {
    const clone = response.clone();
    clone.json().then(json => handleVoyagerResponse(json, url)).catch(() => {});
  }
  return response;
};

function handleVoyagerResponse(json, url) {
  console.log('[JW-Scout] Intercepted Voyager API:', url);

  // Try multiple known response shapes
  const viewers =
    json?.data?.profileViewsByTimeRange?.elements ||
    json?.elements ||
    json?.data?.elements ||
    json?.included?.filter(i => i?.$type?.includes('Viewer') || i?.$type?.includes('ProfileView')) ||
    [];

  if (!viewers || viewers.length === 0) {
    // Log the full response to help debug what shape it is
    console.log('[JW-Scout] No viewers found in response. Keys:', Object.keys(json));
    return;
  }

  console.log(`[JW-Scout] Found ${viewers.length} viewers in API response`);
  viewers.forEach(viewer => processViewer(viewer, 'api'));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRATEGY 2: DOM scraping fallback for profile-views page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DOM_SELECTORS = [
  // Premium profile viewers page cards
  '[data-view-name="profile-analytics-viewers-card"]',
  '.profile-analytics-viewers__card',
  '.viewer-card',
  // Fallback: list items on the analytics page
  'li[class*="analytics-viewer"]',
  'li[class*="profile-view"]',
  // Generic: any LI with a profile link inside
  'li:has(a[href*="/in/"])',
];

function scrapeViewerFromDOM(card) {
  // Try multiple name selectors as LinkedIn obfuscates class names
  const nameEl =
    card.querySelector('[class*="name"]') ||
    card.querySelector('h3') ||
    card.querySelector('h2') ||
    card.querySelector('strong');

  const name = nameEl?.innerText?.trim() || null;

  const titleEl =
    card.querySelector('[class*="headline"]') ||
    card.querySelector('[class*="title"]') ||
    card.querySelector('p');

  const headline = titleEl?.innerText?.trim() || null;

  let title = null, company = null;
  if (headline) {
    const atIdx = headline.lastIndexOf(' at ');
    if (atIdx > -1) {
      title = headline.substring(0, atIdx).trim();
      company = headline.substring(atIdx + 4).trim();
    } else {
      title = headline;
    }
  }

  const linkEl = card.querySelector('a[href*="/in/"]');
  const profileUrl = linkEl?.href || null;

  const imgEl = card.querySelector('img');
  const photo = imgEl?.src || null;

  return { name, title, company, profileUrl, photo, viewedAt: new Date().toISOString() };
}

function domScrape() {
  if (!window.location.href.includes('/analytics/profile-views')) return;

  let found = false;
  for (const selector of DOM_SELECTORS) {
    try {
      const cards = document.querySelectorAll(`${selector}:not([data-jw-scraped])`);
      if (cards.length > 0) {
        found = true;
        cards.forEach(card => {
          card.setAttribute('data-jw-scraped', 'true');
          const viewer = scrapeViewerFromDOM(card);
          processViewer(viewer, 'dom');
        });
      }
    } catch (_) {}
  }
  if (!found && document.querySelector('main')) {
    // Log the page structure to help identify the right elements
    console.log('[JW-Scout] DOM selectors found nothing. Body preview:', document.querySelector('main')?.innerHTML?.slice(0, 500));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED: Process a viewer from either source
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function processViewer(rawViewer, source) {
  let parsed;
  if (source === 'api') {
    parsed = parseVoyagerViewer(rawViewer);
  } else {
    parsed = rawViewer;
  }

  if (!parsed || !parsed.name) return;
  if (isJunk(parsed.name)) {
    console.log('[JW-Scout] Filtered (junk):', parsed.name);
    return;
  }

  // Deduplicate by profile URL or name
  const dedupeKey = parsed.profileUrl || parsed.name;
  if (PROCESSED_IDS.has(dedupeKey)) return;
  PROCESSED_IDS.add(dedupeKey);

  const signal = {
    type: 'profile_view',
    person_name: parsed.name,
    person_title: parsed.title || null,
    person_company: parsed.company || null,
    person_image: parsed.photo || null,
    linkedin_url: parsed.profileUrl || 'https://www.linkedin.com/analytics/profile-views/',
    interaction_text: `${parsed.name} viewed your profile${parsed.company ? ` · ${parsed.company}` : ''}`,
    timestamp: parsed.viewedAt || new Date().toISOString(),
  };

  console.log('[JW-Scout] ✅ Signal captured:', signal.person_name, '|', signal.person_company);
  chrome.runtime.sendMessage({ action: 'SYNC_SIGNAL', payload: signal });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOT: Start DOM observer when on the profile-views page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (window.location.href.includes('/analytics/profile-views')) {
  console.log('[JW-Scout] 🚀 Profile Views page detected. Activating scrapers.');
  
  // Run DOM scrape after initial load
  setTimeout(domScrape, 2000);
  setTimeout(domScrape, 5000);

  // Watch for dynamically loaded content (infinite scroll, pagination)
  const observer = new MutationObserver(() => domScrape());
  observer.observe(document.body, { childList: true, subtree: true });
}
