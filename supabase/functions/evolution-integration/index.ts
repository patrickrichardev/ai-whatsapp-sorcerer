
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

    console.log("EVOLUTION_API_URL:", EVOLUTION_API_URL);
    
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
    
    // First check if instance exists and is already connected
    try {
      const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        }
      });
      
      console.log("Status response status:", statusResponse.status);
      
      // Log the raw response body for debugging
      const rawBody = await statusResponse.text();
      console.log("Raw response body:", rawBody);
      
      // Try to parse as JSON if possible
      let statusData;
      try {
        statusData = JSON.parse(rawBody);
        console.log("Instance status data:", statusData);
        
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
      } catch (parseError) {
        console.error("Failed to parse status response as JSON:", parseError);
        // Continue with instance creation since we couldn't verify status
      }
    } catch (statusError) {
      console.error("Error checking instance status:", statusError);
      // Continue with instance creation since we couldn't verify status
    }
    
    // Create instance if it doesn't exist or isn't connected
    console.log("Creating new instance");
    try {
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
      
      console.log("Create response status:", createResponse.status);
      
      // Log the raw response body for debugging
      const rawCreateBody = await createResponse.text();
      console.log("Raw create response body:", rawCreateBody);
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create instance: HTTP ${createResponse.status}`);
      }
      
      console.log("Instance created successfully");
    } catch (createError) {
      console.error("Error creating instance:", createError);
      throw new Error(`Failed to create instance: ${createError.message}`);
    }
    
    // Connect to the instance
    try {
      const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        method: "POST",
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        }
      });
      
      console.log("Connect response status:", connectResponse.status);
      
      // Log the raw response body for debugging
      const rawConnectBody = await connectResponse.text();
      console.log("Raw connect response body:", rawConnectBody);
      
      if (!connectResponse.ok) {
        throw new Error(`Failed to connect to instance: HTTP ${connectResponse.status}`);
      }
      
      console.log("Instance connection initiated");
    } catch (connectError) {
      console.error("Error connecting to instance:", connectError);
      throw new Error(`Failed to connect to instance: ${connectError.message}`);
    }
    
    // Get QR code
    console.log("Fetching QR code");
    try {
      const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
        headers: {
          "apikey": EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        }
      });
      
      console.log("QR code response status:", qrResponse.status);
      
      // Log the raw response body for debugging
      const rawQrBody = await qrResponse.text();
      console.log("Raw QR response body length:", rawQrBody.length);
      
      if (!qrResponse.ok) {
        throw new Error(`Failed to get QR code: HTTP ${qrResponse.status}`);
      }
      
      // Try to parse as JSON
      let qrData;
      try {
        qrData = JSON.parse(rawQrBody);
      } catch (parseError) {
        console.error("Failed to parse QR response as JSON:", parseError);
        throw new Error("QR code response is not valid JSON");
      }
      
      console.log("QR code fetched successfully");
      
      if (!qrData.qrcode) {
        console.error("No QR code in response:", qrData);
        throw new Error("QR code not available in response");
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
    } catch (qrError) {
      console.error("Error fetching QR code:", qrError);
      throw new Error(`Failed to get QR code: ${qrError.message}`);
    }
  } catch (error) {
    console.error("Error in connectInstance:", error);
    throw error;
  }
}

async function checkInstanceStatus(instanceName: string) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      headers: {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Status check response status:", response.status);
    
    // Log the raw response for debugging
    const rawBody = await response.text();
    console.log("Raw status check response:", rawBody);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(rawBody);
      console.log("Check status response data:", data);
    } catch (parseError) {
      console.error("Failed to parse status response as JSON:", parseError);
      throw new Error("Status response is not valid JSON");
    }
    
    if (!response.ok) {
      throw new Error(`Failed to check instance status: HTTP ${response.status}`);
    }
    
    let result: Record<string, any> = {
      success: true,
      status: data.state === "open" ? "connected" : "disconnected"
    };
    
    // If not connected, try to get QR code
    if (data.state !== "open") {
      try {
        const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
          headers: {
            "apikey": EVOLUTION_API_KEY,
            "Content-Type": "application/json"
          }
        });
        
        console.log("QR check response status:", qrResponse.status);
        
        if (qrResponse.ok) {
          // Log the raw response for debugging
          const rawQrBody = await qrResponse.text();
          console.log("Raw QR check response length:", rawQrBody.length);
          
          // Try to parse as JSON
          try {
            const qrData = JSON.parse(rawQrBody);
            console.log("QR check data available:", !!qrData.qrcode);
            
            if (qrData.qrcode) {
              result.qr = qrData.qrcode;
              result.status = "awaiting_scan";
            }
          } catch (parseError) {
            console.error("Failed to parse QR check response as JSON:", parseError);
          }
        }
      } catch (qrError) {
        console.error("Error checking QR code status:", qrError);
        // Don't throw here, just continue without QR code
      }
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in checkInstanceStatus:", error);
    throw error;
  }
}

async function sendMessage(phone: string, message: string) {
  try {
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
    
    console.log("Instances response status:", instancesResponse.status);
    
    // Log the raw response for debugging
    const rawBody = await instancesResponse.text();
    console.log("Raw instances response:", rawBody);
    
    // Try to parse as JSON
    let instancesData;
    try {
      instancesData = JSON.parse(rawBody);
      console.log("Instances data:", instancesData);
    } catch (parseError) {
      console.error("Failed to parse instances response as JSON:", parseError);
      throw new Error("Instances response is not valid JSON");
    }
    
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
    
    console.log("Send message response status:", sendResponse.status);
    
    // Log the raw response for debugging
    const rawSendBody = await sendResponse.text();
    console.log("Raw send message response:", rawSendBody);
    
    // Try to parse as JSON
    let sendData;
    try {
      sendData = JSON.parse(rawSendBody);
      console.log("Send message data:", sendData);
    } catch (parseError) {
      console.error("Failed to parse send message response as JSON:", parseError);
      throw new Error("Send message response is not valid JSON");
    }
    
    if (!sendResponse.ok) {
      throw new Error(`Failed to send message: HTTP ${sendResponse.status}`);
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
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}

async function disconnectInstance(instanceName: string) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
      method: "DELETE",
      headers: {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Disconnect instance response status:", response.status);
    
    // Log the raw response for debugging
    const rawBody = await response.text();
    console.log("Raw disconnect response:", rawBody);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(rawBody);
      console.log("Disconnect data:", data);
    } catch (parseError) {
      console.error("Failed to parse disconnect response as JSON:", parseError);
      throw new Error("Disconnect response is not valid JSON");
    }
    
    if (!response.ok) {
      throw new Error(`Failed to disconnect instance: HTTP ${response.status}`);
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
  } catch (error) {
    console.error("Error in disconnectInstance:", error);
    throw error;
  }
}
