
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default API configuration 
// Fix the double slash issue by ensuring there's no trailing slash
export const DEFAULT_EVOLUTION_API_URL = 'https://evolutionapi-evolution-api.nqfltx.easypanel.host/manager';
export const DEFAULT_EVOLUTION_API_KEY = '';

// Store custom credentials (temporary, for current session)
export let customCredentials: { apiUrl: string; apiKey: string } = {
  apiUrl: '',
  apiKey: ''
};

// Helper function to safely join URL parts without double slashes
export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
