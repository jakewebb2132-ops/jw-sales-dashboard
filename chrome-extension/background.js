/**
 * JW Sales Command — Background Worker v2
 * Receives signals from content.js and syncs to Supabase
 */

const SUPABASE_URL = "https://cdbvlnxirrfczxdccwbr.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SYNC_SIGNAL") {
    sendToSupabase(request.payload);
  }
  return true; // Keep message channel open for async
});

async function sendToSupabase(signalData) {
  console.log('[JW-Scout] Syncing signal to Supabase:', signalData.person_name);

  try {
    // Check if signal already exists to avoid duplicates
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/signals?select=id&linkedin_url=eq.${encodeURIComponent(signalData.linkedin_url || '')}&timestamp=eq.${encodeURIComponent(signalData.timestamp || '')}&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    const existing = await checkRes.json();
    if (existing?.length > 0) {
      console.log('[JW-Scout] Duplicate signal — skipping:', signalData.person_name);
      return;
    }

    // Insert new signal
    const response = await fetch(`${SUPABASE_URL}/rest/v1/signals`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify([signalData])
    });

    if (response.ok) {
      console.log('[JW-Scout] ✅ Signal saved:', signalData.person_name);
    } else {
      const err = await response.text();
      console.error('[JW-Scout] ❌ Failed to save:', err);
    }
  } catch (e) {
    console.error("[JW-Scout] Network error:", e);
  }
}
