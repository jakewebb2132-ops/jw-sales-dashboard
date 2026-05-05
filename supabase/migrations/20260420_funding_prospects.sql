-- Signal capture: companies to target for Founding GTM Architect role
CREATE TABLE IF NOT EXISTS funding_prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  captured_at TIMESTAMPTZ DEFAULT NOW(),

  -- Company
  company_name TEXT NOT NULL,
  company_url TEXT,
  funding_stage TEXT,         -- 'Seed' | 'Series A'
  amount_raised TEXT,         -- e.g. '$4M', '$12M'
  industry TEXT,

  -- Founder
  founder_name TEXT,
  founder_title TEXT,
  founder_linkedin TEXT,
  founder_background TEXT,    -- brief: 'PhD Stanford ML', 'Ex-Research Scientist Google Brain'

  -- Location
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,

  -- Hiring signals
  gtm_roles_open INTEGER DEFAULT 0,
  gtm_role_titles TEXT[],     -- ['SDR', 'AE', 'Head of Marketing']
  high_value BOOLEAN DEFAULT FALSE,  -- true if gtm_roles_open >= 3
  has_head_of_sales BOOLEAN DEFAULT FALSE,  -- disqualifier

  -- Stakeholders
  lead_vc TEXT,
  vc_talent_partner TEXT,
  vc_talent_partner_linkedin TEXT,

  -- Meta
  source TEXT,                -- 'TechCrunch' | 'Wellfound' | 'YC' | 'Axios' | 'StrictlyVC'
  source_url TEXT,
  funding_announced_date DATE,
  status TEXT DEFAULT 'new',  -- 'new' | 'reviewed' | 'contacted' | 'pass'
  notes TEXT
);

-- Enable realtime so dashboard updates live
ALTER PUBLICATION supabase_realtime ADD TABLE funding_prospects;
