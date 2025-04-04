
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
  console.log(`[VERBOSE] Method: "${method}"`);
  
  // Unified URL construction - DO NOT add "/manager" to the URL
  const url = joinUrl(baseUrl, endpoint);
  console.log(`[VERBOSE] Final URL: "${url}"`);

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      // Use AbortController to set a timeout
      signal: AbortSignal.timeout(15000) // 15 second timeout
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
      console.log(`[VERBOSE] Request body: ${JSON.stringify(body, null, 2)}`);
    }

    const response = await fetch(url, options);

    // Log API response status
    console.log(`Evolution API response status: ${response.status}`);
    
    let responseBody: any;
    
    // Try to parse the response as JSON
    try {
      responseBody = await response.json();
      console.log(`[VERBOSE] Response body: ${JSON.stringify(responseBody, null, 2)}`);
    } catch (e) {
      // If response is not JSON, get it as text
      const textBody = await response.text();
      console.log(`[VERBOSE] Response body (text): ${textBody}`);
      
      // Re-throw with the response text
      if (!response.ok) {
        throw new Error(`Evolution API returned status ${response.status}: ${textBody}`);
      }
      
      // Return a simple object for non-JSON responses
      return { success: response.ok, text: textBody };
    }
    
    // Handle non-2xx responses with JSON body
    if (!response.ok) {
      throw new Error(`Evolution API returned status ${response.status}: ${JSON.stringify(responseBody)}`);
    }

    return responseBody;
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
