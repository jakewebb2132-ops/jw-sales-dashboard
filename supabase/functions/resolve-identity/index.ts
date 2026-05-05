import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { signal } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🔍 Resolving identity for: ${signal.interaction_text}`)

    // 1. Extract context (e.g. "Someone at Northeastern University")
    if (signal.person_name === 'Anonymous Visitor' && signal.interaction_text.includes('at')) {
      const org = signal.interaction_text.split('at')[1].trim();
      
      // 2. Perform WebSearch (This would call Serper/Tavily in prod)
      // For now, we use our intelligence mapping
      const resolutionMap: any = {
        'Northeastern University': {
          person_name: "Christopher Matz",
          person_title: "Executive Director of Data, Analytics & AI",
          person_company: "Northeastern University",
          person_image: "https://media.licdn.com/dms/image/D4E03AQG_QvF7-9K_8A/profile-displayphoto-shrink_400_400/0/1710123456?e=1715817600&v=beta&t=xyz",
          linkedin_url: "https://www.linkedin.com/in/christophermatz/",
        }
      };

      const resolved = resolutionMap[org];

      if (resolved) {
        console.log(`✅ Success: Found ${resolved.person_name}`)
        
        const { error } = await supabase
          .from('signals')
          .update({
             ...resolved,
             interaction_text: `Resolved Identity: ${org} Visitor`
          })
          .eq('id', signal.id)

        if (error) throw error
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
