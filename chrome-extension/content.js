/**
 * JW Sales Command — LinkedIn Scout v3
 * 
 * Strategy:
 *   1. Inject bridge.js into the MAIN world to hook API calls
 *   2. Listen for 'VOYAGER_DATA' messages from the bridge
 *   3. Fall back to DOM scraping
 */

console.log('[JW-Scout] 🛰️ Content Script Initialized.');

// 1. Inject the bridge script
function injectBridge() {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('bridge.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
    console.log('[JW-Scout] 🛠️ Bridge script injected.');
  } catch (e) {
    console.error('[JW-Scout] ❌ Injection failed:', e);
  }
}

injectBridge();

// 2. Listen for data from the bridge
window.addEventListener('message', (event) => {
  if (event.data?.source === 'jw-scout-bridge' && event.data?.type === 'VOYAGER_DATA') {
    handleVoyagerResponse(event.data.data, event.data.url);
  }
});

const PROCESSED_IDS = new Set();
const EXCLUSION_PATTERNS = [
  /^LinkedIn Member$/i,
  /found you through/i,
  /senior leaders? who share/i,
  /connections? who may be hiring/i,
  /open roles? you may be interested in/i,
  /View the full details/i,
  /^\d+ (work at|are|have)/i,
  /^Manage settings$/i,
];

function isJunk(name) {
  if (!name || name.length === 0) return true;
  return EXCLUSION_PATTERNS.some(pattern => pattern.test(name));
}

function parseVoyagerViewer(viewer) {
  try {
    const name = viewer?.name?.text
      || viewer?.memberInfo?.memberName
      || viewer?.actorName?.text
      || viewer?.title?.text
      || (viewer?.memberDistance?.localizedFirstName ? `${viewer.memberDistance.localizedFirstName} ${viewer.memberDistance.localizedLastName || ''}`.trim() : null)
      || viewer?.navigationContext?.actionTargetTitle
      || null;

    const headline = viewer?.occupation
      || viewer?.memberInfo?.memberHeadlineText
      || viewer?.headline?.text
      || viewer?.subtext?.text
      || viewer?.subtitle?.text
      || null;

    let title = null, company = null;
    if (headline) {
      const atIdx = headline.lastIndexOf(' at ');
      if (atIdx > -1) {
        title = headline.substring(0, atIdx).trim();
        company = headline.substring(atIdx + 4).trim();
      } else {
        const dividerIdx = headline.indexOf(' · ');
        if (dividerIdx > -1) {
            title = headline.substring(0, dividerIdx).trim();
            company = headline.substring(dividerIdx + 3).trim();
        } else {
            title = headline;
        }
      }
    }

    const profileUrl = viewer?.navigationUrl
      || (viewer?.memberInfo?.publicIdentifier ? `https://www.linkedin.com/in/${viewer.memberInfo.publicIdentifier}` : null)
      || viewer?.navigationContext?.actionTarget
      || null;

    let photo = null;
    const imgData = viewer?.profilePicture || viewer?.image || viewer?.avatar;
    if (imgData?.displayImageReference?.vectorImage) {
        const root = imgData.displayImageReference.vectorImage.rootUrl || '';
        const segment = imgData.displayImageReference.vectorImage.artifacts?.[0]?.fileIdentifyingUrlPathSegment;
        if (segment) photo = `${root}${segment}`;
    } else if (imgData?.attributes?.[0]?.detailData?.nonUnderlineLink?.actionTarget) {
        photo = imgData.attributes[0].detailData.nonUnderlineLink.actionTarget;
    } else if (typeof imgData === 'string' && imgData.startsWith('http')) {
        photo = imgData;
    }

    const viewedAt = viewer?.lastViewedAt
      || viewer?.viewedAt
      || viewer?.createdAt
      || new Date().toISOString();

    return { name, title, company, profileUrl, photo, viewedAt };
  } catch (e) {
    return null;
  }
}

function handleVoyagerResponse(json, url) {
  let viewers = [];
  const findViewers = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
        if (obj.some(item => item?.$type?.includes('Viewer') || item?.$type?.includes('ProfileView') || item?.memberInfo || item?.name)) {
            viewers = viewers.concat(obj);
        } else obj.forEach(findViewers);
    } else Object.values(obj).forEach(findViewers);
  };

  viewers = json?.data?.profileViewsByTimeRange?.elements ||
            json?.elements ||
            json?.data?.elements ||
            json?.included?.filter(i => i?.$type?.includes('Viewer') || i?.$type?.includes('ProfileView')) ||
            [];

  if (viewers.length === 0) findViewers(json);

  const validViewers = viewers.filter(v => v && (v.name || v.memberInfo || v.actorName || v.title));
  if (validViewers.length > 0) {
    console.log(`[JW-Scout] 💎 API: Found ${validViewers.length} viewers`);
    validViewers.forEach(viewer => processViewer(viewer, 'api'));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOM scraping fallback
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function domScrape() {
  if (!window.location.href.includes('/analytics/profile-views') && !window.location.href.includes('/analytics/recruiter-views')) return;

  const selectors = [
    'span[aria-hidden="true"]',
    '[class*="name"]',
    'h3',
    '.member-analytics-addon-entity-list__link'
  ];

  let cards = document.querySelectorAll(`[class*="analytics-viewer"]:not([data-jw-scraped]), [class*="card"]:has(a[href*="/in/"]):not([data-jw-scraped])`);
  
  cards.forEach(card => {
    card.setAttribute('data-jw-scraped', 'true');
    let name = null;
    for (const sel of selectors) {
        const el = card.querySelector(sel);
        if (el?.innerText?.trim().length > 3) {
            name = el.innerText.trim();
            break;
        }
    }
    
    if (name) {
        const titleEl = card.querySelector('[class*="headline"]') || card.querySelector('p');
        const imgEl = card.querySelector('img');
        const linkEl = card.querySelector('a[href*="/in/"]');
        
        processViewer({
            name,
            title: titleEl?.innerText?.trim(),
            photo: imgEl?.src,
            profileUrl: linkEl?.href,
            viewedAt: new Date().toISOString()
        }, 'dom');
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED: Process a viewer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function processViewer(rawViewer, source) {
  const parsed = (source === 'api') ? parseVoyagerViewer(rawViewer) : rawViewer;

  if (!parsed || !parsed.name || isJunk(parsed.name)) return;

  const dedupeKey = parsed.profileUrl || parsed.name;
  if (PROCESSED_IDS.has(dedupeKey)) return;
  PROCESSED_IDS.add(dedupeKey);

  const isRecruiterPage = window.location.href.includes('/recruiter-views');
  
  const signal = {
    type: isRecruiterPage ? 'recruiter_view' : 'profile_view',
    person_name: parsed.name,
    person_title: parsed.title || null,
    person_company: parsed.company || null,
    person_image: parsed.photo || null,
    linkedin_url: parsed.profileUrl || window.location.href,
    interaction_text: isRecruiterPage 
      ? `${parsed.name} viewed your profile (Recruiter)`
      : `${parsed.name} viewed your profile${parsed.company ? ` · ${parsed.company}` : ''}`,
    timestamp: parsed.viewedAt || new Date().toISOString(),
  };

  chrome.runtime.sendMessage({ action: 'SYNC_SIGNAL', payload: signal });
}

// Watch for DOM changes
if (window.location.href.includes('/analytics/')) {
    setInterval(domScrape, 3000);
}
