import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // N8N webhook endpoint
    const N8N_WEBHOOK = 'https://n8n.vetorix.com.br/webhook-test/TkSolution';
    
    console.log('Calling N8N webhook with message:', message);
    
    // Try POST request first (most common for N8N webhooks)
    let response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    // If POST fails with 404, try GET with query parameter
    if (!response.ok && response.status === 404) {
      console.log('POST failed with 404, trying GET method');
      const encodedMessage = encodeURIComponent(message);
      response = await fetch(`${N8N_WEBHOOK}?message=${encodedMessage}`);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`N8N webhook error (${response.status}):`, errorText);
      throw new Error(`N8N webhook returned status ${response.status}: ${errorText}`);
    }

    // Parse the response
    const assistantResponse = await response.text();
    console.log('N8N response received:', assistantResponse.substring(0, 100));

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calling N8N webhook:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
