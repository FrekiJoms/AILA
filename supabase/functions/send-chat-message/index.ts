import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, sessionId, name, email, askForSuggestions } = await req.json();

    // 1. Get the secret webhook URL from Supabase's environment variables.
    const chatWebhookUrl = Deno.env.get("CHAT_WEBHOOK_URL");
    if (!chatWebhookUrl) {
      throw new Error("CHAT_WEBHOOK_URL is not set in Supabase secrets.");
    }

    // 2. Forward the payload to your n8n webhook.
    const webhookResponse = await fetch(chatWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, name, email, askForSuggestions }),
    });

    if (!webhookResponse.ok) {
        const errorBody = await webhookResponse.text();
        throw new Error(`Webhook failed with status ${webhookResponse.status}: ${errorBody}`);
    }

    const responseData = await webhookResponse.json();

    // 3. Return the response from the webhook back to the client.
    return new Response(JSON.stringify(responseData), {
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
