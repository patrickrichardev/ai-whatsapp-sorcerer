
// Re-export types
export * from "./types";

// Re-export from connection.ts - be explicit to avoid conflicts
export { 
  updateEvolutionAPICredentials,
  testEvolutionAPIConnection 
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

// We don't need to export a default function that combines both test functions
// since we're already correctly exporting the connection test version by default
