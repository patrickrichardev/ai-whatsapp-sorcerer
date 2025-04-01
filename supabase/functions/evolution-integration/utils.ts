
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
  if (body) {
    console.log(`[VERBOSE] Request body: ${JSON.stringify(body, null, 2)}`);
  }
  
  // Unified URL construction - DO NOT add "/manager" to the URL
  const url = joinUrl(baseUrl, endpoint);
  console.log(`[VERBOSE] Final URL: "${url}"`);

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Only add apikey if it's provided and not empty
    if (apiKey && apiKey.trim() !== '') {
      headers['apikey'] = apiKey;
    }
    
    // Make multiple attempts if needed
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[VERBOSE] API call attempt ${attempts} of ${maxAttempts}`);
        
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          // Use AbortController to set a timeout - increased for reliability
          signal: AbortSignal.timeout(60000) // 60 second timeout
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
          
          console.error(`Evolution API returned status ${response.status}: ${errorBody}`);
          
          // Special case for 404 not found - could be that the endpoint is different
          // Don't retry on 404s unless it's the last attempt
          if (response.status === 404 && attempts < maxAttempts) {
            console.log(`[VERBOSE] Got 404, trying alternative endpoint format`);
            lastError = new Error(`Evolution API returned status ${response.status}: ${errorBody}`);
            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error(`Evolution API returned status ${response.status}: ${errorBody}`);
        }

        // Parse successful response
        return await response.json();
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempts} failed:`, error);
        
        // Wait before next attempt
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // If we exhausted all attempts
    throw lastError || new Error("All API call attempts failed");
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
