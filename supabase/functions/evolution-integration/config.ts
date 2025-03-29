
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL base da API sem "/api" ou "/manager" no final
export const DEFAULT_EVOLUTION_API_URL = 'https://evolutionapi.dev';
export const DEFAULT_EVOLUTION_API_KEY = '';

// Credenciais customizadas (temporárias, para a sessão atual)
export let customCredentials: { apiUrl: string; apiKey: string } = {
  apiUrl: '',
  apiKey: ''
};

// Função auxiliar para juntar partes de URL sem barras duplas
export function joinUrl(base: string, path: string): string {
  // Remove barras no final da URL base
  const cleanBase = base.replace(/\/+$/, '');
  
  // Une com o caminho do endpoint, garantindo que não haja barras duplas
  return `${cleanBase}/${path.replace(/^\/+/, '')}`;
}
