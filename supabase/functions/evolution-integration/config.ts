
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default API configuration 
// Make sure the URL includes a trailing slash to prevent path issues
export const DEFAULT_EVOLUTION_API_URL = 'https://evolutionapi-evolution-api.nqfltx.easypanel.host/manager/';
export const DEFAULT_EVOLUTION_API_KEY = '';

// Store custom credentials (temporary, for current session)
export let customCredentials: { apiUrl: string; apiKey: string } = {
  apiUrl: '',
  apiKey: ''
};
