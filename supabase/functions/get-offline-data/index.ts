import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (_req) => {
  try {
    // 1. Get the secret URL for your offline data.
    const offlineDataUrl = Deno.env.get("OFFLINE_DATA_URL");
    if (!offlineDataUrl) {
      throw new Error("OFFLINE_DATA_URL is not set in Supabase secrets.");
    }

    // 2. Fetch the data from your Google Apps Script.
    const response = await fetch(offlineDataUrl);
    if (!response.ok) {
      throw new Error(`Offline data source responded with status: ${response.status}`);
    }
    const data = await response.json();

    // 3. Return the data to the client.
    return new Response(JSON.stringify(data), {
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
