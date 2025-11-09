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

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // N8N webhook endpoint
    const N8N_WEBHOOK = 'https://n8n.vetorix.com.br/webhook-test/TkSolution';
    
    // Make GET request to N8N
    const response = await fetch(`${N8N_WEBHOOK}?message=${encodedMessage}`);
    
    if (!response.ok) {
      throw new Error(`N8N webhook returned status ${response.status}`);
    }

    // Parse the response
    const assistantResponse = await response.text();

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
