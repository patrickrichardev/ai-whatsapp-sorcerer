
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter a URL e chave da API do ambiente
    const apiUrl = Deno.env.get('EVOLUTION_API_URL') || '';
    
    // Mascarar a API key por segurança - mostramos apenas os últimos 4 caracteres
    const apiKey = Deno.env.get('EVOLUTION_API_KEY') || '';
    const maskedApiKey = apiKey 
      ? `***${apiKey.substring(Math.max(0, apiKey.length - 4))}` 
      : 'Não configurada';

    return new Response(
      JSON.stringify({
        success: true,
        config: {
          evolution_api_url: apiUrl,
          evolution_api_key: maskedApiKey,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
