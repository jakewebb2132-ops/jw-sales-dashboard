import { createClient } from '@supabase/supabase-js';

import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateDailyReport() {
  console.log("📊 Generating LinkedIn Intent Report (Last 24 Hours)...");
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: signals, error } = await supabase
    .from('signals')
    .select('*')
    .gte('timestamp', sevenDaysAgo)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("❌ Error fetching signals:", error.message);
    return;
  }

  const highIntentLeads = signals.filter(s => s.person_name !== 'Pending Enrichment' && s.person_name !== 'Unknown' && s.person_name !== 'Anonymous Visitor');
  const enrichmentNeeded = signals.filter(s => s.person_name === 'Pending Enrichment');

  console.log(`\n✅ FOUND ${highIntentLeads.length} HIGH-INTENT PROFILES`);
  highIntentLeads.slice(0, 5).forEach((lead, i) => {
    console.log(`${i+1}. 👤 ${lead.person_name} (${lead.person_title || 'Lead'})`);
    console.log(`   🏢 ${lead.person_company || 'Unknown Company'}`);
    console.log(`   🔗 ${lead.linkedin_url || 'No URL'}`);
    console.log(`   🕒 ${new Date(lead.timestamp).toLocaleTimeString()}\n`);
  });

  if (enrichmentNeeded.length > 0) {
    console.log(`⚠️  NOTE: ${enrichmentNeeded.length} signals require AI enrichment via WebSearch (Pillar 1).`);
  }

  console.log("\n--- Report Complete: Ready for RemoteTrigger (Daily 8am) ---");
}

generateDailyReport();
