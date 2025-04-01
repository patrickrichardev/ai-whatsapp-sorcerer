
// Re-export types
export * from "./types";

// Re-export from connection.ts
export { 
  updateEvolutionAPICredentials,
  testEvolutionAPIConnection 
} from "./connection";

// Re-export instance functions
export {
  initializeWhatsAppInstance,
  checkWhatsAppStatus,
  disconnectWhatsAppInstance,
  createEvolutionInstance
} from "./instance";

// Re-export messaging functions
export * from "./messaging";

// Export a default test function
export { testEvolutionAPIConnection as default } from "./connection";
