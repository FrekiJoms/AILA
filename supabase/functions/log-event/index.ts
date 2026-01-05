
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const eventPayload = await req.json();

    // 1. Get the secret Google Apps Script URL.
    const scriptApiUrl = Deno.env.get("SCRIPT_API_URL");
    if (!scriptApiUrl) {
      throw new Error("SCRIPT_API_URL is not set in Supabase secrets.");
    }

    // 2. Forward the payload to your script.
    // Google Apps Script in "fire and forget" mode doesn't return a useful response,
    // so we don't need to wait for it or check the response.
    fetch(scriptApiUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    });

    // 3. Immediately return a success response to the client.
    return new Response(JSON.stringify({ success: true, message: "Event logged." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
