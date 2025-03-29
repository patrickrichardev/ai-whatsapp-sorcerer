
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default API configuration 
// Use base URL without /api
export const DEFAULT_EVOLUTION_API_URL = 'https://evolutionapi-evolution-api.nqfltx.easypanel.host';
export const DEFAULT_EVOLUTION_API_KEY = '';

// Store custom credentials (temporary, for current session)
export let customCredentials: { apiUrl: string; apiKey: string } = {
  apiUrl: '',
  apiKey: ''
};

// Helper function to safely join URL parts without double slashes
export function joinUrl(base: string, path: string): string {
  // Remove trailing slashes from base URL
  const cleanBase = base.replace(/\/+$/, '');
  
  // Join with the endpoint path, ensuring no double slashes
  return `${cleanBase}/${path.replace(/^\/+/, '')}`;
}
