
// connect.ts
import {
  createResponse,
  callEvolutionAPI,
  getCredentials
} from "../../utils.ts";

export async function handleConnect(
  connection_id: string,
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  try {
    const { data: connection, error: connectionError } = await supabaseClient
      .from("agent_connections")
      .select("*")
      .eq("id", connection_id)
      .single();

    if (connectionError || !connection) {
      throw new Error(`Erro ao buscar a conexão: ${connectionError?.message || 'Conexão não encontrada'}`);
    }

    const instanceName = `conn_${connection_id}`;

    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);

    console.log("[DEBUG] Criando instância:", instanceName);

    // Cria instância
    const createInstanceData = await callEvolutionAPI(
      evolutionApiUrl,
      "instance/create",
      evolutionApiKey,
      "POST",
      {
        instanceName,
        token: connection_id,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        reject_call: true,
        groupsIgnore: true,
        alwaysOnline: true,
        readMessages: true,
        readStatus: true,
        syncFullHistory: true
      }
    );

    console.log("[DEBUG] Instância criada:", createInstanceData);

    // Conecta a instância e busca o QR Code
    const connectionData = await callEvolutionAPI(
      evolutionApiUrl,
      `instance/connect/${instanceName}`,
      evolutionApiKey,
      "POST"
    );

    console.log("[DEBUG] Dados da conexão:", connectionData);

    if (connectionData.qrcode) {
      const qr = connectionData.qrcode.split(",")[1];

      await supabaseClient
        .from("agent_connections")
        .update({
          is_active: false,
          connection_data: {
            status: "awaiting_scan",
            qr,
            name: instanceName
          }
        })
        .eq("id", connection_id);

      return createResponse({
        success: true,
        qr,
        status: "awaiting_scan"
      });
    } else {
      throw new Error("QR Code não retornado pela Evolution API.");
    }
  } catch (error) {
    console.error("[ERRO] Falha ao conectar:", error);
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}
