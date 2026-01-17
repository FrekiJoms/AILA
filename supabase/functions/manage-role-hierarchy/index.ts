import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for edge function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RoleHierarchyItem {
  id?: number;
  role_name: string;
  hierarchy_order: number;
  color: string;
  description?: string;
}

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function getSystemUser(token: string) {
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error || !user) {
    throw new Error("Unauthorized");
  }
  return user;
}

async function getRoleHierarchy() {
  const { data, error } = await supabaseClient
    .from("role_hierarchy")
    .select("*")
    .order("hierarchy_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch role hierarchy: ${error.message}`);
  }

  return data;
}

async function updateRoleHierarchy(roles: RoleHierarchyItem[], token: string) {
  // Verify user is an admin
  const user = await getSystemUser(token);

  // Check if user is an admin (Founder or Main Developer)
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("email", user.email)
    .single();

  if (profileError || !profile) {
    throw new Error("User profile not found");
  }

  if (!["Founder", "Head Developer", "Developer"].includes(profile.role)) {
    throw new Error("Insufficient permissions to update role hierarchy");
  }

  // Update each role in the hierarchy
  const updates = [];
  for (const role of roles) {
    updates.push(
      supabaseClient
        .from("role_hierarchy")
        .upsert({
          role_name: role.role_name,
          hierarchy_order: role.hierarchy_order,
          color: role.color,
          description: role.description || "",
        }, { onConflict: 'role_name' })
    );
  }

  const results = await Promise.all(updates);

  // Check for errors
  for (const result of results) {
    if (result.error) {
      throw new Error(`Failed to update role hierarchy: ${result.error.message}`);
    }
  }

  return true;
}

async function deleteRole(roleName: string, token: string) {
  // Verify user is a Founder (only Founder can delete roles)
  const user = await getSystemUser(token);

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("email", user.email)
    .single();

  if (profileError || !profile || profile.role !== "Founder") {
    throw new Error("Only Founders can delete roles");
  }

  const { error } = await supabaseClient
    .from("role_hierarchy")
    .delete()
    .eq("role_name", roleName);

  if (error) {
    throw new Error(`Failed to delete role: ${error.message}`);
  }

  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const { action, roles, roleName } = await req.json();

    let result;
    switch (action) {
      case "list":
        result = await getRoleHierarchy();
        break;

      case "update":
        if (!roles || !Array.isArray(roles)) {
          return new Response(
            JSON.stringify({ error: "Invalid roles format" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
        result = await updateRoleHierarchy(roles, token);
        break;

      case "delete":
        if (!roleName) {
          return new Response(
            JSON.stringify({ error: "Missing roleName" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
        result = await deleteRole(roleName, token);
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
