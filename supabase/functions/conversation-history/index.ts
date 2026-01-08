import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversationRequest {
  action: "list" | "save" | "load" | "delete" | "rename" | "search";
  conversationId?: string;
  title?: string;
  messages?: Array<{ role: string; content: string }>;
  searchQuery?: string;
}

// Decode JWT token and extract user ID (without verification, since Supabase already verified it)
function getUserIdFromToken(token: string): string {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Decode payload (add padding if needed)
    const payload = parts[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    const data = JSON.parse(decoded);

    const userId = data.sub;
    if (!userId) {
      throw new Error("No user ID in token");
    }

    return userId;
  } catch (error) {
    console.error("Token decode error:", error);
    throw new Error("Invalid token");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = getUserIdFromToken(token);

    // Create Supabase client with SERVICE_ROLE_KEY for database access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const body: ConversationRequest = await req.json();
    
    console.log(`Processing ${body.action} action for user ${userId}`);

    // List conversations
    if (body.action === "list") {
      const { data, error } = await supabase
        .from("conversation_history")
        .select("id, title, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return new Response(JSON.stringify({ conversations: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save conversation
    if (body.action === "save") {
      console.log("Save request body:", JSON.stringify(body));
      
      if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        throw new Error("Messages array is required and cannot be empty");
      }

      // Auto-generate title from first user message if empty
      let finalTitle = (body.title || "").trim();
      if (!finalTitle) {
        const firstUserMsg = body.messages.find((m) => m.role === "user");
        if (firstUserMsg) {
          finalTitle = firstUserMsg.content.substring(0, 50);
        } else {
          finalTitle = "Untitled Conversation";
        }
      }

      if (body.conversationId) {
        // Update existing
        const { error } = await supabase
          .from("conversation_history")
          .update({
            title: finalTitle,
            messages: body.messages,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.conversationId)
          .eq("user_id", userId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, id: body.conversationId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Create new
        const { data, error } = await supabase
          .from("conversation_history")
          .insert({
            user_id: userId,
            title: finalTitle,
            messages: body.messages,
          })
          .select("id")
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Load conversation
    if (body.action === "load") {
      if (!body.conversationId) {
        throw new Error("Conversation ID is required");
      }

      const { data, error } = await supabase
        .from("conversation_history")
        .select("*")
        .eq("id", body.conversationId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Conversation not found");

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete conversation
    if (body.action === "delete") {
      if (!body.conversationId) {
        throw new Error("Conversation ID is required");
      }

      const { error } = await supabase
        .from("conversation_history")
        .delete()
        .eq("id", body.conversationId)
        .eq("user_id", userId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rename conversation
    if (body.action === "rename") {
      if (!body.conversationId || !body.title) {
        throw new Error("Conversation ID and title are required");
      }

      const { error } = await supabase
        .from("conversation_history")
        .update({ title: body.title.trim() })
        .eq("id", body.conversationId)
        .eq("user_id", userId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Search conversations
    if (body.action === "search") {
      if (!body.searchQuery) {
        throw new Error("Search query is required");
      }

      const query = body.searchQuery.toLowerCase();
      const { data, error } = await supabase
        .from("conversation_history")
        .select("id, title, updated_at")
        .eq("user_id", userId)
        .filter("title", "ilike", `%${query}%`)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return new Response(JSON.stringify({ conversations: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (error) {
    console.error("Edge function error:", error);
    
    const isValidationError = error.message.includes("required") || error.message.includes("Unknown action");
    const statusCode = isValidationError ? 400 : 500;
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
