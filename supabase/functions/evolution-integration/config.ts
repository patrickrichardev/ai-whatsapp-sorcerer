
// Configuration and constants for the Evolution API integration

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Default credentials that will be overridden if custom ones are provided
export const DEFAULT_EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'http://localhost:8080'
export const DEFAULT_EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || 'your-api-key'

// Helper to store custom credentials temporarily (in a real-world scenario, you'd store this in a database)
export let customCredentials: { apiUrl?: string; apiKey?: string } = {}
