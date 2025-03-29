
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default API configuration 
// Use /api path instead of /manager
export const DEFAULT_EVOLUTION_API_URL = 'https://evolutionapi-evolution-api.nqfltx.easypanel.host/api';
export const DEFAULT_EVOLUTION_API_KEY = '';

// Store custom credentials (temporary, for current session)
export let customCredentials: { apiUrl: string; apiKey: string } = {
  apiUrl: '',
  apiKey: ''
};

// Helper function to safely join URL parts without double slashes
// Now handles both /api and /manager paths correctly
export function joinUrl(base: string, path: string): string {
  // Remove trailing slashes and clean up any /manager or /api at the end
  // if they're already part of the base URL
  const cleanBase = base.replace(/\/+$/, '')
                        .replace(/\/manager\/?$/, '')
                        .replace(/\/api\/?$/, '');
  
  // Add /api to the base URL if it doesn't already have it
  const baseWithPath = cleanBase + '/api';
  
  // Join with the endpoint path, ensuring no double slashes
  return `${baseWithPath}/${path.replace(/^\/+/, '')}`;
}
