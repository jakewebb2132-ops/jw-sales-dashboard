import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMemoryLocal() {
  console.log("📥 Pulling memory local from Supabase...");

  const { data: signals, error } = await supabase
    .from('signals')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    console.error("❌ Error fetching signals:", error.message);
    return;
  }

  const memoryDir = path.join(process.cwd(), 'memory');
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir);
  }

  const snapshotPath = path.join(memoryDir, 'signals_snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(signals, null, 2));

  console.log(`✅ Synced ${signals.length} signals to ${snapshotPath}`);
  console.log("--- Memory Pull Complete ---");
}

syncMemoryLocal();
