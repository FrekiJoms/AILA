import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetRoleRequest {
  targetEmail: string;
  role: string;
  roleColor: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get the user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    const {
      data: { user: currentUser },
      error: userError
    } = await supabaseUser.auth.getUser(token);

    if (userError || !currentUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("email")
      .eq("email", currentUser.email)
      .single();

    if (adminError) {
      console.error("Admin check error:", adminError);
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

    const requestBody: SetRoleRequest = await req.json();
    const { targetEmail, role, roleColor } = requestBody;

    if (!targetEmail || !role) {
      return new Response(
        JSON.stringify({ error: "Missing targetEmail or role" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the user by email in auth.users table
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError || !authUsers) {
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const targetUser = authUsers.users.find((u) => u.email === targetEmail);

    if (!targetUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Update user role in profiles table
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: role,
        role_color: roleColor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUser.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update role: ${updateError.message}`);
    }

    if (!updateData) {
      console.warn("No data returned from update, but no error either - this may be expected");
    }

    return new Response(
      JSON.stringify({
        message: `Role updated to ${role} successfully`,
        user: targetEmail,
        role: role,
        roleColor: roleColor,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in set-role function:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

