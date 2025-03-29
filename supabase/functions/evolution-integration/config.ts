
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default API configuration 
// Não inclui o /manager no final da URL base
export const DEFAULT_EVOLUTION_API_URL = 'https://evolutionapi-evolution-api.nqfltx.easypanel.host';
export const DEFAULT_EVOLUTION_API_KEY = '';

// Store custom credentials (temporary, for current session)
export let customCredentials: { apiUrl: string; apiKey: string } = {
  apiUrl: '',
  apiKey: ''
};

// Helper function to safely join URL parts without double slashes
export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '').replace(/\/manager$/, '')}/${path.replace(/^\/+/, '')}`;
}
