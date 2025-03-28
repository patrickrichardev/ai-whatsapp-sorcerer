
// Re-export types
export * from "./types";

// Re-export from connection.ts - be explicit to avoid conflicts
export { 
  updateEvolutionAPICredentials,
  testEvolutionAPIConnection as testEvolutionAPIConnection_connection 
} from "./connection";

// Re-export instance functions - be explicit to avoid conflicts
export {
  initializeWhatsAppInstance,
  checkWhatsAppStatus,
  disconnectWhatsAppInstance,
  testEvolutionAPIConnection as testEvolutionAPIConnection_instance
} from "./instance";

// Re-export messaging functions
export * from "./messaging";

// Export a default function that combines both test functions
export function testEvolutionAPIConnection(credentials?: import("./types").EvolutionAPICredentials) {
  // By default, use the connection test implementation
  return testEvolutionAPIConnection_connection(credentials);
}
