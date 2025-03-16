import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type WhatsAppAction = "connect" | "status" | "send" | "disconnect";

interface RequestBody {
  action: WhatsAppAction;
  agent_id?: string;
  phone?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.error("Missing EVOLUTION_API_URL or EVOLUTION_API_KEY");
      throw new Error("Evolution API configuration is missing. Please set EVOLUTION_API_URL and EVOLUTION_API_KEY.");
    }

    const requestData = await req.json() as RequestBody;
    const { action, agent_id, phone, message } = requestData;
    
    console.log(`Processing ${action} request`, { agent_id, phone });

    // Instance name based on agent ID (used to identify the WhatsApp instance)
    const instanceName = agent_id ? `agent_${agent_id}` : undefined;

    switch (action) {
      case "connect":
        if (!instanceName) throw new Error("agent_id is required");
        return await connectInstance(instanceName);
        
      case "status":
        if (!instanceName) throw new Error("agent_id is required");
        return await checkInstanceStatus(instanceName);
        
      case "send":
        if (!phone || !message) throw new Error("phone and message are required");
        return await sendMessage(phone, message);
        
      case "disconnect":
        if (!instanceName) throw new Error("agent_id is required");
        return await disconnectInstance(instanceName);
        
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error("Evolution API Error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An error occurred while processing your request" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});

async function connectInstance(instanceName: string) {
  try {
    console.log(`Connecting instance: ${instanceName}`);
    console.log(`Evolution API URL: ${EVOLUTION_API_URL}`);
    
    // First check if instance exists
    const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      headers: {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
      }
    });
    
    const statusData = await statusResponse.json();
    console.log("Instance status:", statusData);
    
    // If instance exists and connected, return status
    if (statusResponse.ok && statusData.state === "open") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "connected"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Create instance if it doesn't exist
    if (!statusResponse.ok || statusData.state === "close") {
      console.log("Creating new instance");
      // Try to create the instance
      const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: "POST",
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instanceName,
          token: instanceName,
          qrcode: true
        })
      });
      
      if (!createResponse.ok) {
        const createData = await createResponse.json();
        console.error("Create instance failed:", createData);
        throw new Error(`Failed to create instance: ${createData.error || createData.message || JSON.stringify(createData)}`);
      }
      
      console.log("Instance created successfully");
      
      // Connect to the instance
      const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        method: "POST",
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        }
      });
      
      if (!connectResponse.ok) {
        const connectData = await connectResponse.json();
        console.error("Connect instance failed:", connectData);
        throw new Error(`Failed to connect to instance: ${connectData.error || connectData.message || JSON.stringify(connectData)}`);
      }
      
      console.log("Instance connected successfully");
    }
    
    // Get QR code
    console.log("Fetching QR code");
    const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
      headers: {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
      }
    });
    
    if (!qrResponse.ok) {
      const qrData = await qrResponse.json();
      console.error("Get QR code failed:", qrData);
      throw new Error(`Failed to get QR code: ${qrData.error || qrData.message || JSON.stringify(qrData)}`);
    }
    
    const qrData = await qrResponse.json();
    console.log("QR code fetched successfully");
    
    if (!qrData.qrcode) {
      console.error("No QR code in response:", qrData);
      throw new Error("QR code not available");
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        qr: qrData.qrcode,
        status: "awaiting_scan"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in connectInstance:", error);
    throw error;
  }
}

async function checkInstanceStatus(instanceName: string) {
  const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
    headers: {
      "apikey": EVOLUTION_API_KEY,
      "Content-Type": "application/json"
    }
  });
  
  const data = await response.json();
  console.log("Check status response:", data);
  
  if (!response.ok) {
    throw new Error(`Failed to check instance status: ${data.error || data.message || "Unknown error"}`);
  }
  
  let result: Record<string, any> = {
    success: true,
    status: data.state === "open" ? "connected" : "disconnected"
  };
  
  // If not connected, try to get QR code
  if (data.state !== "open") {
    const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
      headers: {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
      }
    });
    
    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      if (qrData.qrcode) {
        result.qr = qrData.qrcode;
        result.status = "awaiting_scan";
      }
    }
  }
  
  return new Response(
    JSON.stringify(result),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

async function sendMessage(phone: string, message: string) {
  // Normalize phone number (remove non-digits, ensure it starts with country code)
  const normalizedPhone = phone.replace(/\D/g, '');
  if (!normalizedPhone.match(/^\d{10,15}$/)) {
    throw new Error("Invalid phone number format");
  }
  
  // Find instance to use - using the first connected instance
  const instancesResponse = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
    headers: {
      "apikey": EVOLUTION_API_KEY,
      "Content-Type": "application/json"
    }
  });
  
  const instancesData = await instancesResponse.json();
  console.log("Instances response:", instancesData);
  
  if (!instancesResponse.ok || !instancesData.instance || instancesData.instance.length === 0) {
    throw new Error("No WhatsApp instances available");
  }
  
  // Find a connected instance
  const connectedInstance = instancesData.instance.find((inst: any) => inst.state === "open");
  if (!connectedInstance) {
    throw new Error("No connected WhatsApp instances available");
  }
  
  // Send the message
  const sendResponse = await fetch(`${EVOLUTION_API_URL}/message/text/${connectedInstance.instance}`, {
    method: "POST",
    headers: {
      "apikey": EVOLUTION_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      number: normalizedPhone,
      options: {
        delay: 1200
      },
      textMessage: {
        text: message
      }
    })
  });
  
  const sendData = await sendResponse.json();
  console.log("Send message response:", sendData);
  
  if (!sendResponse.ok) {
    throw new Error(`Failed to send message: ${sendData.error || sendData.message || "Unknown error"}`);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Message sent successfully" 
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

async function disconnectInstance(instanceName: string) {
  const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
    method: "DELETE",
    headers: {
      "apikey": EVOLUTION_API_KEY,
      "Content-Type": "application/json"
    }
  });
  
  const data = await response.json();
  console.log("Disconnect instance response:", data);
  
  if (!response.ok) {
    throw new Error(`Failed to disconnect instance: ${data.error || data.message || "Unknown error"}`);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Instance disconnected successfully" 
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}
