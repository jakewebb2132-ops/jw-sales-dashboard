// background.js - Listens to content script and relays to backend securely
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_SIGNAL") {
        sendToSupabase(request.payload);
    }
});

async function sendToSupabase(signalData) {
    // In production, we retrieve this config via chrome.storage from a login flow
    const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
    const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"; 

    try {
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
        
        if (!response.ok) {
            console.error('Failed to sync signal to Supabase');
        }
    } catch (e) {
        console.error("Network error syncing signal: ", e);
    }
}
