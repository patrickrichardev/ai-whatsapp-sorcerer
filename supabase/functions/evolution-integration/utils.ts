
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, joinUrl, DEFAULT_EVOLUTION_API_URL } from "./config.ts";

// Create Supabase client
export function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader || '' } } }
  );
}

// Gets the Evolution API credentials from environment or request
export async function getCredentials(credentials?: { apiUrl?: string; apiKey?: string }) {
  // Use the credentials from the request first, if provided
  if (credentials?.apiUrl && credentials?.apiKey) {
    // Clean up the URL - remove trailing slashes
    const cleanApiUrl = credentials.apiUrl.replace(/\/+$/, '');
    
    return {
      evolutionApiUrl: cleanApiUrl,
      evolutionApiKey: credentials.apiKey
    };
  }
  
  // Custom credentials object from config (used for runtime updates)
  const { customCredentials } = await import("./config.ts");
  if (customCredentials.apiUrl && customCredentials.apiKey) {
    // Clean up the URL
    const cleanApiUrl = customCredentials.apiUrl.replace(/\/+$/, '');
    
    return {
      evolutionApiUrl: cleanApiUrl,
      evolutionApiKey: customCredentials.apiKey
    };
  }
  
  // Fall back to environment variables or default URL if not set
  let envApiUrl = Deno.env.get('EVOLUTION_API_URL') || DEFAULT_EVOLUTION_API_URL;
  // Clean up the URL from environment variables
  envApiUrl = envApiUrl.replace(/\/+$/, '');
  
  return {
    evolutionApiUrl: envApiUrl,
    evolutionApiKey: Deno.env.get('EVOLUTION_API_KEY') || ''
  };
}

// Helper to safely make API requests to the Evolution API
export async function callEvolutionAPI(
  baseUrl: string, 
  endpoint: string, 
  apiKey: string, 
  method = 'GET',
  body?: any
) {
  // More verbose logging for URL construction
  console.log(`[VERBOSE] Making API call to Evolution API:`);
  console.log(`[VERBOSE] Base URL (raw): "${baseUrl}"`);
  console.log(`[VERBOSE] Endpoint (raw): "${endpoint}"`);
  
  // Unified URL construction - DO NOT add "/manager" to the URL
  const url = joinUrl(baseUrl, endpoint);
  console.log(`[VERBOSE] Final URL: "${url}"`);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: body ? JSON.stringify(body) : undefined,
      // Use AbortController to set a timeout
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    // Log API response status
    console.log(`Evolution API response status: ${response.status}`);
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorBody: string;
      try {
        // Try to parse as JSON
        const errorJson = await response.json();
        errorBody = JSON.stringify(errorJson);
      } catch {
        // If not JSON, get as text
        errorBody = await response.text();
      }
      
      throw new Error(`Evolution API returned status ${response.status}: ${errorBody}`);
    }

    // Parse successful response
    return await response.json();
  } catch (error) {
    console.error(`Error calling Evolution API ${endpoint}:`, error);
    throw error;
  }
}

// Standard response helper
export function createResponse(body: any, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// Error response helper
export function createErrorResponse(message: string, status = 500) {
  return createResponse({ 
    success: false, 
    error: message 
  }, status);
}
