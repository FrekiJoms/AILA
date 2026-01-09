import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- THIS IS THE FIX ---
    // We are now using names that are not reserved by Supabase.
    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // Check if the user making the request is an admin
    const { data: { user: callingUser } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')!.replace('Bearer ', ''));
    
    if (!callingUser) {
      throw new Error('🛑 SECURITY: You are not authorized to perform this action.');
    }

    // Check if calling user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
      .from('admins')
      .select('email')
      .eq('email', callingUser.email)
      .single()
    
    if (!adminCheck || adminCheckError) {
      throw new Error('🛑 SECURITY: You are not authorized to perform this action.');
    }
    
    // Get the target user's email from the request
    const { targetEmail } = await req.json();
    if (!targetEmail) {
      throw new Error('Invalid input: "targetEmail" is required.');
    }

    // Generate a secure, one-time magic link for the target user
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: targetEmail,
    });
    if (error) throw error;

    // Return the link
    return new Response(JSON.stringify({ magicLink: data.properties.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
