
export interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  qr?: string;
  qrcode?: string;
  status?: string;
  error?: string;
  details?: string;
  partialSuccess?: boolean;
  instanceCreated?: boolean;
  instanceName?: string;
  diagnostics?: {
    apiUrl?: string;
    requestData?: any;
    responseStatus?: number;
    message?: string;
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
