import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteRoleRequest {
  targetEmail: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== delete-role function start ===");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get the user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log("Token extracted, length:", token.length);
    
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    const {
      data: { user: currentUser },
      error: userError
    } = await supabaseUser.auth.getUser(token);

    if (userError || !currentUser) {
      console.error("User auth failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log("Current user:", currentUser.email);

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("email")
      .eq("email", currentUser.email)
      .single();

    if (adminError) {
      console.error("Admin check error:", adminError.message, adminError.code);
      return new Response(JSON.stringify({ error: `Admin verification failed: ${adminError.message}` }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (!adminData) {
      console.error(`User ${currentUser.email} is not an admin`);
      return new Response(JSON.stringify({ error: "Not an admin" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    console.log("Admin verified:", adminData.email);

    // Parse request body
    let requestBody: DeleteRoleRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { targetEmail } = requestBody;

    if (!targetEmail) {
      console.error("Missing targetEmail");
      return new Response(
        JSON.stringify({ error: "Missing targetEmail" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Deleting role for ${targetEmail}`);

    // Find the user by email in auth.users table
    // Need to paginate through all users because listUsers() only returns first page
    let allAuthUsers = [];
    let page = 1;
    let hasMore = true;
    const fetchPageSize = 100;

    while (hasMore) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: fetchPageSize
        });

        if (error || !data) {
          console.error("Failed to fetch users on page", page, ":", error?.message);
          break;
        }

        if (!data.users || data.users.length === 0) {
          hasMore = false;
          break;
        }

        allAuthUsers = allAuthUsers.concat(data.users);
        console.log(`Fetched ${data.users.length} users from page ${page}, total so far: ${allAuthUsers.length}`);

        if (data.users.length < fetchPageSize) {
          hasMore = false;
        }
        page++;
      } catch (err) {
        console.error("Error fetching page", page, ":", err);
        break;
      }
    }

    console.log(`Total users fetched: ${allAuthUsers.length}, looking for: ${targetEmail}`);

    const targetUser = allAuthUsers.find((u: any) => u.email === targetEmail);

    if (!targetUser) {
      console.error(`User ${targetEmail} not found in ${allAuthUsers.length} total users`);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    console.log(`Found user: ${targetEmail} with ID: ${targetUser.id}`);

    // Delete user role in profiles table by setting role and role_color to NULL
    console.log(`Attempting to delete role for user: ${targetEmail} (ID: ${targetUser.id})`);
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: null,
        role_color: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUser.id);

    if (updateError) {
      console.error("Delete error details:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint
      });
      return new Response(
        JSON.stringify({ 
          error: `Failed to delete role: ${updateError.message}` 
        }), 
        { status: 500, headers: corsHeaders }
      );
    }

    console.log("Role deleted successfully");

    return new Response(
      JSON.stringify({
        message: `Role deleted successfully for ${targetEmail}`,
        user: targetEmail,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Uncaught error in delete-role function:", errorMessage);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");
    
    return new Response(JSON.stringify({ error: `Internal server error: ${errorMessage}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
