import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { researchContact } from '../contact-research/run.js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Static resolution map — fast-path cache for already-known orgs.
 * New discoveries from the live search agent are NOT added here;
 * they are written directly to Supabase as the source of truth.
 */
const resolutionMap = {
  'Northeastern University': {
    person_name: 'Christopher Matz',
    person_title: 'Executive Director of Data, Analytics & AI',
    person_image: 'https://media.licdn.com/dms/image/D4E03AQG_QvF7-9K_8A/profile-displayphoto-shrink_400_400/0/1710123456?e=1715817600&v=beta&t=xyz',
    linkedin_url: 'https://www.linkedin.com/in/christophermatz/',
  },
  'Texas McCombs School of Business': {
    person_name: 'Francesca Parodi',
    person_title: 'Chief Marketing and Communications Officer',
    person_image: 'https://media.licdn.com/dms/image/D5603AQHU_QvF7-9K_8A/profile-displayphoto-shrink_400_400/0/1710123456?e=1715817600&v=beta&t=xyz',
    linkedin_url: 'https://www.linkedin.com/in/francescaparodi/',
  },
  'Interloper Films': {
    person_name: 'Ondi Timoner',
    person_title: 'Director & Founder',
    person_image: 'https://media.licdn.com/dms/image/v2/D5603AQE-O-xR4H-8HA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/16987654321?e=1715817600&v=beta&t=xyz',
    linkedin_url: 'https://www.linkedin.com/in/onditimoner/',
  },
  'Bridge Executive Search': {
    person_name: 'Linda (Lead Contact)',
    person_title: 'Managing Partner',
    person_image: 'https://media.licdn.com/dms/image/v2/D5603AQE-QvF7-9K_8A/profile-displayphoto-shrink_400_400/0/1710123456?e=1715817600&v=beta&t=xyz',
    linkedin_url: 'https://www.linkedin.com/company/bridge-executive-search/',
  },
};

async function updateSignal(signalId, resolvedData) {
  const { error } = await supabase
    .from('signals')
    .update(resolvedData)
    .eq('id', signalId);

  if (error) console.error('   ❌ Update failed:', error.message);
  else console.log('   ✅ Database updated successfully.');
}

/**
 * Pillar 1: Identity Resolution Worker
 * 1. Check static cache (fast path)
 * 2. Fall back to live contact-research skill (Claude + web search)
 * 3. Write resolved contact back to Supabase
 */
async function resolveAnonymousSignals() {
  console.log('🔍 Running Identity Resolution (Pillar 1)...\n');

  const { data: signals, error } = await supabase
    .from('signals')
    .select('*')
    .eq('person_name', 'Anonymous Visitor')
    .limit(5);

  if (error) {
    console.error('❌ Error fetching signals:', error.message);
    return;
  }

  if (signals.length === 0) {
    console.log('✅ No anonymous signals needing resolution.');
    return;
  }

  console.log(`📡 Analyzing ${signals.length} anonymous signals...\n`);

  const stats = { cached: 0, liveResolved: 0, failed: 0 };

  for (const signal of signals) {
    console.log(`🔹 [ID: ${signal.id.slice(0, 8)}] "${signal.interaction_text}"`);

    if (!signal.interaction_text?.includes('at')) {
      console.log('   ⚠️  No org pattern found — skipping.');
      stats.failed++;
      console.log('-----------------------------------');
      continue;
    }

    const org = signal.interaction_text.split('at')[1].trim();
    console.log(`   🎯 Organization: ${org}`);

    // --- Fast path: static cache ---
    if (resolutionMap[org]) {
      const resolved = {
        ...resolutionMap[org],
        person_company: org,
        interaction_text: `Resolved Intent: ${org} Leadership`,
      };
      console.log(`   ⚡ CACHED: ${resolved.person_name} (${resolved.person_title})`);
      await updateSignal(signal.id, resolved);
      stats.cached++;

    // --- Live path: contact-research skill ---
    } else {
      console.log('   🤖 Not in cache — invoking live contact-research agent...');
      const contact = await researchContact(org, signal.interaction_text);

      if (contact) {
        const resolved = {
          person_name: contact.person_name,
          person_title: contact.person_title,
          person_company: contact.person_company ?? org,
          linkedin_url: contact.linkedin_url,
          interaction_text: `Resolved Intent: ${org} Leadership`,
        };
        console.log(`   ✨ LIVE RESOLVED: ${resolved.person_name} (${resolved.person_title})`);
        console.log(`   📊 Confidence: ${contact.confidence}`);
        await updateSignal(signal.id, resolved);
        stats.liveResolved++;
      } else {
        console.log('   ⚠️  Could not resolve — marking for manual review.');
        await updateSignal(signal.id, {
          person_name: 'Pending Enrichment',
          interaction_text: `Unresolved: ${org}`,
        });
        stats.failed++;
      }
    }

    console.log('-----------------------------------');
  }

  console.log(`\n📊 Resolution Summary:`);
  console.log(`   ⚡ Cached:        ${stats.cached}`);
  console.log(`   ✨ Live Resolved: ${stats.liveResolved}`);
  console.log(`   ⚠️  Unresolved:   ${stats.failed}`);
}

resolveAnonymousSignals();
