import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse query params for pagination and search
    const url = new URL(req.url)
    const pageParam = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSizeParam = parseInt(url.searchParams.get('pageSize') || '30', 10)
    const search = url.searchParams.get('search')?.toLowerCase() || ''

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Fetch all users
    let allAuthUsers = []
    let page = 1
    let hasMore = true
    const fetchPageSize = 100

    while (hasMore) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: fetchPageSize
        })
        
        if (error) {
          console.error('Auth error on page', page, ':', error)
          break
        }
        
        if (!data || !data.users || data.users.length === 0) {
          hasMore = false
          break
        }
        
        allAuthUsers = allAuthUsers.concat(data.users)
        
        if (data.users.length < fetchPageSize) {
          hasMore = false
        }
        page++
      } catch (err) {
        console.error('Error fetching page', page, ':', err)
        break
      }
    }

    // Transform users data for frontend
    let transformedUsers = (allAuthUsers || []).map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: 'user', // Will be replaced with data from profiles
      role_color: '#4D96FF',
      avatar_url: user.user_metadata?.avatar_url,
      user_metadata: user.user_metadata || {},
    }))

    // Fetch profiles to get role data
    const userIds = transformedUsers.map(u => u.id)
    let profilesMap = {}
    
    if (userIds.length > 0) {
      try {
        const { data: profilesData, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('id, role, role_color')
          .in('id', userIds)
        
        if (profilesError) {
          console.warn('Error fetching profiles:', profilesError.message)
        } else if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map((p: any) => [p.id, p]))
          console.log('Fetched', profilesData.length, 'profiles')
          
          // Merge profile data into users
          transformedUsers = transformedUsers.map(user => ({
            ...user,
            role: profilesMap[user.id]?.role || '-',
            role_color: profilesMap[user.id]?.role_color || '#4D96FF'
          }))
        }
      } catch (err) {
        console.error('Error fetching profiles:', err)
      }
    }

    // Filter by search if provided
    if (search) {
      transformedUsers = transformedUsers.filter(user =>
        user.email?.toLowerCase().includes(search) ||
        user.name?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search)
      )
    }

    // Paginate results
    const total = transformedUsers.length
    const totalPages = Math.ceil(total / pageSizeParam)
    const paginatedUsers = transformedUsers.slice((pageParam - 1) * pageSizeParam, pageParam * pageSizeParam)

    return new Response(
      JSON.stringify({
        users: paginatedUsers,
        page: pageParam,
        pageSize: pageSizeParam,
        total,
        totalPages
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})