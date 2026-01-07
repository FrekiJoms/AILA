import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface AdminRequest {
  action: "add" | "remove" | "list";
  email?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    const userEmail = userData.user.email;

    // Check if user is an admin
    const { data: adminCheck, error: adminError } = await supabase
      .from("admins")
      .select("email")
      .eq("email", userEmail)
      .single();

    if (adminError || !adminCheck) {
      return new Response(
        JSON.stringify({ error: "Only admins can manage admins" }),
        {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body: AdminRequest = await req.json();

    if (body.action === "list") {
      // List all admins
      const { data: admins, error } = await supabase
        .from("admins")
        .select("id, email, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ admins }), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    } else if (body.action === "add") {
      if (!body.email) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return new Response(JSON.stringify({ error: "Invalid email format" }), {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }

      // Add new admin
      const { data: newAdmin, error } = await supabase
        .from("admins")
        .insert({
          email: body.email.toLowerCase(),
          created_by: userEmail,
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({
            error: error.message || "Failed to add admin",
          }),
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Admin added successfully",
          admin: newAdmin,
        }),
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    } else if (body.action === "remove") {
      if (!body.email) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }

      // Prevent removing yourself
      if (body.email === userEmail) {
        return new Response(
          JSON.stringify({ error: "Cannot remove yourself as an admin" }),
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Remove admin
      const { error } = await supabase
        .from("admins")
        .delete()
        .eq("email", body.email);

      if (error) {
        return new Response(
          JSON.stringify({
            error: error.message || "Failed to remove admin",
          }),
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({ message: "Admin removed successfully" }),
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});
