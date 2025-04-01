
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

    // Check if instance was created successfully
    if (!createInstanceData || createInstanceData.error) {
      throw new Error(`Erro ao criar instância: ${createInstanceData?.error || 'Resposta vazia da API'}`);
    }

    // Extract QR code from the instance creation response if available
    let qrCode = null;
    if (createInstanceData.qrcode && createInstanceData.qrcode.base64) {
      qrCode = createInstanceData.qrcode.base64.split(",")[1] || createInstanceData.qrcode.base64;
    }

    // Update connection in database regardless of whether we have QR code yet
    await supabaseClient
      .from("agent_connections")
      .update({
        is_active: false,
        connection_data: {
          status: qrCode ? "awaiting_scan" : "pending",
          qr: qrCode,
          name: instanceName,
          instanceCreated: true
        }
      })
      .eq("id", connection_id);

    if (qrCode) {
      return createResponse({
        success: true,
        qr: qrCode,
        status: "awaiting_scan",
        instanceCreated: true,
        instanceName
      });
    }

    // Try to get QR code if not available yet
    try {
      // Wait a moment for the instance to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const connectionData = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/qrcode/${instanceName}`,
        evolutionApiKey,
        "GET"
      );

      console.log("[DEBUG] Dados do QR Code:", connectionData);

      if (connectionData && connectionData.qrcode) {
        const qr = connectionData.qrcode.split(",")[1] || connectionData.qrcode;

        await supabaseClient
          .from("agent_connections")
          .update({
            is_active: false,
            connection_data: {
              status: "awaiting_scan",
              qr,
              name: instanceName,
              instanceCreated: true
            }
          })
          .eq("id", connection_id);

        return createResponse({
          success: true,
          qr,
          status: "awaiting_scan",
          instanceCreated: true,
          instanceName
        });
      }
    } catch (qrError) {
      console.log("[DEBUG] Falha ao obter QR code, mas instância foi criada:", qrError);
      // We won't throw here since the instance was created successfully
    }

    // Return partial success if instance was created but QR code is not available yet
    return createResponse({
      success: true,
      partialSuccess: true,
      error: "QR Code não disponível ainda, mas instância foi criada.",
      status: "pending",
      instanceCreated: true,
      instanceName
    });
  } catch (error) {
    console.error("[ERRO] Falha ao conectar:", error);
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}
