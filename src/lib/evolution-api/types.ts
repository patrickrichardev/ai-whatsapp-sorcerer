
export interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  qrcode?: string;
  status?: string;
  error?: string;
  details?: string;
  diagnostics?: {
    apiUrl?: string;
    requestData?: any;
    responseStatus?: number;
  };
}

export interface WhatsAppInstance {
  instanceName: string;
  status: string;
  qrcode?: string;
}

export interface EvolutionAPICredentials {
  apiUrl: string;
  apiKey: string;
}
