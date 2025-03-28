
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
  disconnectWhatsAppInstance
} from "./instance";

// Re-export messaging functions
export * from "./messaging";

// Export a default test function that combines both connection test functions
export { testEvolutionAPIConnection as default } from "./connection";
