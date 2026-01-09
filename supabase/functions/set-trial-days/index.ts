import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Get calling user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callingUser }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !callingUser) {
      throw new Error('Unauthorized')
    }

    // Check if calling user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
      .from('admins')
      .select('email')
      .eq('email', callingUser.email)
      .single()
    
    if (adminCheckError || !adminCheck) {
      throw new Error('You are not authorized to perform this action.')
    }
    
    const { targetEmail, days } = await req.json()
    if (!targetEmail || typeof days !== 'number') {
      throw new Error('Invalid input: "targetEmail" and "days" are required.')
    }

    // Fetch all users from Supabase (paginated)
    let allUsers = []
    let page = 1
    let hasMore = true
    const pageSize = 100

    while (hasMore) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: pageSize
        })
        if (error) {
          console.error('Auth error on page', page, ':', error)
          break
        }
        if (!data || !data.users || data.users.length === 0) {
          hasMore = false
          break
        }
        allUsers = allUsers.concat(data.users)
        if (data.users.length < pageSize) {
          hasMore = false
        }
        page++
      } catch (err) {
        console.error('Error fetching page', page, ':', err)
        break
      }
    }

    const targetUser = allUsers.find(u => u.email === targetEmail)
    if (!targetUser) {
      throw new Error(`User with email "${targetEmail}" not found.`)
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { user_metadata: { custom_trial_days: days } }
    )
    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: `Success! Trial for ${targetEmail} has been set to ${days} days.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
