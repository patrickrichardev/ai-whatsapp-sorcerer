
import { corsHeaders, customCredentials, DEFAULT_EVOLUTION_API_URL, DEFAULT_EVOLUTION_API_KEY } from "./config.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Utility function to get credentials
export function getCredentials(requestCredentials?: { apiUrl?: string; apiKey?: string }) {
  const evolutionApiUrl = requestCredentials?.apiUrl || 
                          customCredentials.apiUrl || 
                          Deno.env.get('EVOLUTION_API_URL') || 
                          DEFAULT_EVOLUTION_API_URL;
                          
  const evolutionApiKey = requestCredentials?.apiKey || 
                          customCredentials.apiKey || 
                          Deno.env.get('EVOLUTION_API_KEY') || 
                          DEFAULT_EVOLUTION_API_KEY;
  
  return { evolutionApiUrl, evolutionApiKey };
}

// Create Supabase client
export function createSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );
}

// Utility function to create response with CORS headers
export function createResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
  );
}

// Utility function to create error response
export function createErrorResponse(error: string, status = 500, details?: any) {
  return createResponse({ 
    success: false,
    error, 
    details 
  }, status);
}
