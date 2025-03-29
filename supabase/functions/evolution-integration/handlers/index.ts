
// Exporta todos os handlers do diretório handlers
export { handleUpdateCredentials, handleTestConnection } from "./credentials.ts";
export { handleConnect, handleStatus, handleDisconnect } from "./connection/index.ts";
export { handleSend } from "./messaging.ts";
