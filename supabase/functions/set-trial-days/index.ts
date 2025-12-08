
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ADMIN_EMAILS = [
  "narvasajoshua61@gmail.com",
  "levercrafter@gmail.com"
];

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

    const { data: { user: callingUser } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')!.replace('Bearer ', ''));
    if (!callingUser || !ADMIN_EMAILS.includes(callingUser.email)) {
      throw new Error('🛑 SECURITY: You are not authorized to perform this action.');
    }
    
    const { targetEmail, days } = await req.json();
    if (!targetEmail || typeof days !== 'number') {
      throw new Error('Invalid input: "targetEmail" and "days" are required.');
    }

    const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (listUsersError) throw listUsersError;

    const targetUser = users.find(u => u.email === targetEmail);
    if (!targetUser) {
      throw new Error(`User with email "${targetEmail}" not found.`);
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { user_metadata: { custom_trial_days: days } }
    );
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ message: `✅ Success! Trial for ${targetEmail} has been set to ${days} days.` }), {
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
