/**
 * JW Sales Command — Background Worker v2
 * Receives signals from content.js and syncs to Supabase
 */

const SUPABASE_URL = "https://cdbvlnxirrfczxdccwbr.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"; // Removed hardcoded secret for GitHub Push Protection

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
      
      // AUTOMATION: If it's an anonymous lead, trigger Pillar 1 Enrichment
      if (signalData.person_name === 'Anonymous Visitor') {
        console.log('[JW-Scout] 🤖 Anonymous Lead detected. Triggering real-time de-anonymization...');
        triggerEnrichment(signalData);
      }
    } else {
      const err = await response.text();
      console.error('[JW-Scout] ❌ Failed to save:', err);
    }
  } catch (e) {
    console.error("[JW-Scout] Network error:", e);
  }
}

/**
 * Triggers the Pillar 1 Identity Resolution worker.
 * In a production environment, this calls a Supabase Edge Function or Vercel API.
 */
async function triggerEnrichment(signalData) {
  // POC: For now, we signal to the dashboard that resolution is needed.
  // Future: fetch('https://your-api.com/api/resolve', { method: 'POST', body: JSON.stringify(signalData) });
  console.log('[JW-Scout] ✨ Identity Resolution queued for:', signalData.interaction_text);
}
