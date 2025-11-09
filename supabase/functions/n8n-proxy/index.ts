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

    // N8N webhook endpoint (test)
    const N8N_WEBHOOK = 'https://n8n.vetorix.com.br/webhook-test/TkSolution';
    
    console.log('Calling N8N webhook with message:', message);
    
    // Make POST request to N8N
    const response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`N8N webhook error (${response.status}):`, errorText);
      throw new Error(`N8N webhook returned status ${response.status}: ${errorText}`);
    }

    // Parse the response - try JSON first, then text
    let assistantResponse: string;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const jsonData = await response.json();
      console.log('N8N JSON response:', jsonData);
      // Extract the response from various possible JSON structures
      assistantResponse = jsonData.response || jsonData.message || jsonData.text || JSON.stringify(jsonData);
    } else {
      assistantResponse = await response.text();
      console.log('N8N text response:', assistantResponse.substring(0, 100));
    }
    
    if (!assistantResponse || assistantResponse.trim() === '') {
      throw new Error('N8N returned empty response');
    }

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
