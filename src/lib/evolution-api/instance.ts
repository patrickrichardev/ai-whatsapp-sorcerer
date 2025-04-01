
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse } from "./types";

/**
 * Initialize a WhatsApp instance by connection ID
 * @param connectionId The connection ID to initialize
 * @returns Promise with the API response
 */
export const initializeWhatsAppInstance = async (
  connectionId: string
): Promise<EvolutionAPIResponse> => {
  try {
    console.log(`Initializing WhatsApp instance for connection ID: ${connectionId}`);
    
    // Create an AbortController with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: {
        action: "connect",
        connection_id: connectionId,
      },
      // Don't include signal property in FunctionInvokeOptions
      // signal: controller.signal, // This caused the error
    });
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error("Error initializing WhatsApp instance:", error);
      return {
        success: false,
        error: error.message,
        details: "Error during Evolution API function invocation",
      };
    }
    
    console.log("WhatsApp instance initialization response:", data);
    return data;
  } catch (err: any) {
    console.error("Exception initializing WhatsApp instance:", err);
    return {
      success: false,
      error: err.message || "Unknown error",
      details: "Exception during initialization request",
    };
  }
};

/**
 * Check the status of a WhatsApp instance by connection ID
 * @param connectionId The connection ID to check
 * @returns Promise with the API response
 */
export const checkWhatsAppStatus = async (
  connectionId: string
): Promise<EvolutionAPIResponse> => {
  try {
    console.log(`Checking WhatsApp status for connection ID: ${connectionId}`);
    
    // Create an AbortController with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: {
        action: "status",
        connection_id: connectionId,
      },
      // Don't include signal property in FunctionInvokeOptions
      // signal: controller.signal, // This caused the error
    });
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error("Error checking WhatsApp status:", error);
      return {
        success: false,
        error: error.message,
        details: "Error during Evolution API function invocation",
      };
    }
    
    console.log("WhatsApp status check response:", data);
    return data;
  } catch (err: any) {
    console.error("Exception checking WhatsApp status:", err);
    return {
      success: false,
      error: err.message || "Unknown error",
      details: "Exception during status check request",
    };
  }
};

/**
 * Disconnect a WhatsApp instance by connection ID
 * @param connectionId The connection ID to disconnect
 * @returns Promise with the API response
 */
export const disconnectWhatsAppInstance = async (
  connectionId: string
): Promise<EvolutionAPIResponse> => {
  try {
    console.log(`Disconnecting WhatsApp instance for connection ID: ${connectionId}`);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: {
        action: "disconnect",
        connection_id: connectionId,
      },
    });
    
    if (error) {
      console.error("Error disconnecting WhatsApp instance:", error);
      return {
        success: false,
        error: error.message,
        details: "Error during Evolution API function invocation",
      };
    }
    
    console.log("WhatsApp instance disconnection response:", data);
    return data;
  } catch (err: any) {
    console.error("Exception disconnecting WhatsApp instance:", err);
    return {
      success: false,
      error: err.message || "Unknown error",
      details: "Exception during disconnection request",
    };
  }
};

/**
 * Test the connection to the Evolution API
 * @returns Promise with the API response
 */
export const testEvolutionAPIConnection = async (): Promise<EvolutionAPIResponse> => {
  try {
    console.log("Testing connection to Evolution API");
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: {
        action: "test",
      },
    });
    
    if (error) {
      console.error("Error testing Evolution API connection:", error);
      return {
        success: false,
        error: error.message,
        details: "Error during Evolution API function invocation",
      };
    }
    
    console.log("Evolution API connection test response:", data);
    return data;
  } catch (firstError: any) {
    console.error("Exception testing Evolution API connection:", firstError);
    
    // Try to get more diagnostic information
    try {
      // This test call will return details about where the configuration is failing
      const { data, error: testError } = await supabase.functions.invoke("evolution-integration", {
        body: {
          action: "credentials_test",
        },
      });
      
      if (testError) {
        return {
          success: false,
          error: firstError.message || "Unknown error",
          details: "Exception during connection test",
          diagnostics: { 
            requestData: testError.message,
            responseStatus: 500
          }
        };
      }
      
      return {
        success: false,
        error: firstError.message || "Unknown error",
        details: "Exception during connection test",
        diagnostics: data
      };
    } catch (secondError: any) {
      // We'll just return the first error if we can't get diagnostics
      return {
        success: false,
        error: firstError.message || "Unknown error",
        details: "Exception during connection test, diagnostics also failed",
      };
    }
  }
};

/**
 * Create a new Evolution API instance with configuration
 * @param instanceName Name for the new instance
 * @param config Configuration object for the instance
 * @returns Promise with the API response
 */
export const createEvolutionInstance = async (
  instanceName: string,
  config: any
): Promise<EvolutionAPIResponse> => {
  try {
    console.log(`Creating Evolution API instance ${instanceName} with config:`, config);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: {
        action: "create_instance",
        instanceName,
        config
      },
    });
    
    if (error) {
      console.error("Error creating Evolution API instance:", error);
      return {
        success: false,
        error: error.message,
        details: "Error during Evolution API function invocation",
      };
    }
    
    console.log("Evolution API instance creation response:", data);
    return data;
  } catch (err: any) {
    console.error("Exception creating Evolution API instance:", err);
    return {
      success: false,
      error: err.message || "Unknown error",
      details: "Exception during instance creation request",
    };
  }
};
