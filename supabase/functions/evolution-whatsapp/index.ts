
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obter as variáveis de ambiente
const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";

serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar as credenciais da API
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error("Credenciais da Evolution API não configuradas");
    }

    const { action, instanceId } = await req.json();

    if (!instanceId) {
      throw new Error("ID da instância não fornecido");
    }

    // Lógica baseada na ação
    switch (action) {
      case "getQRCode":
        return await getQRCode(instanceId);
      case "checkStatus":
        return await checkStatus(instanceId);
      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }
  } catch (error) {
    console.error(`Erro no processamento:`, error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Função para criar uma instância do WhatsApp e obter o QR code
async function getQRCode(instanceId: string) {
  console.log(`Obtendo QR code para instância: ${instanceId}`);

  try {
    // Primeiro, verifica se a instância já existe
    const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      }
    });

    const statusData = await statusResponse.json();
    console.log("Status da instância:", statusData);

    // Se a instância não existir (status 404), cria uma nova
    if (!statusResponse.ok || statusData.error) {
      console.log("Criando nova instância...");
      const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          instanceName: instanceId,
          qrcode: true,
          webhook: false
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(`Erro ao criar instância: ${JSON.stringify(errorData)}`);
      }

      console.log("Instância criada, conectando...");
      
      // Conecta a instância após a criação
      const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        }
      });

      if (!connectResponse.ok) {
        const errorData = await connectResponse.json();
        throw new Error(`Erro ao conectar instância: ${JSON.stringify(errorData)}`);
      }
    }

    // Obtém o QR Code
    const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      }
    });

    if (!qrResponse.ok) {
      const errorData = await qrResponse.json();
      throw new Error(`Erro ao obter QR code: ${JSON.stringify(errorData)}`);
    }

    const qrData = await qrResponse.json();
    
    // Processa o QR code que pode vir em diferentes formatos
    let qrCode = null;
    
    if (qrData.qrcode) {
      if (typeof qrData.qrcode === 'string') {
        qrCode = qrData.qrcode;
        // Remove o prefixo data:image/png;base64, se presente
        if (qrCode.includes('data:image')) {
          qrCode = qrCode.split(',')[1];
        }
      } else if (qrData.qrcode.base64) {
        qrCode = qrData.qrcode.base64;
        if (qrCode.includes('data:image')) {
          qrCode = qrCode.split(',')[1];
        }
      } else if (qrData.qrcode.code) {
        qrCode = qrData.qrcode.code;
      }
    }

    if (!qrCode) {
      throw new Error("QR code não encontrado na resposta");
    }

    console.log("QR code obtido com sucesso");

    return new Response(
      JSON.stringify({ 
        success: true, 
        qrCode: qrCode
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Erro ao obter QR code:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro ao obter QR code" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Função para verificar o status da conexão
async function checkStatus(instanceId: string) {
  console.log(`Verificando status para instância: ${instanceId}`);

  try {
    const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      }
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json();
      throw new Error(`Erro ao verificar status: ${JSON.stringify(errorData)}`);
    }

    const statusData = await statusResponse.json();
    console.log("Status da conexão:", statusData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: statusData.state || "unknown"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro ao verificar status" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
