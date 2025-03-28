
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default API configuration
export const DEFAULT_EVOLUTION_API_URL = 'https://evolutionapi.cloud/instance';
export const DEFAULT_EVOLUTION_API_KEY = ''; // Should be set via env var

// Store custom credentials (temporary, for current session)
export let customCredentials: { apiUrl: string; apiKey: string } = {
  apiUrl: '',
  apiKey: ''
};
