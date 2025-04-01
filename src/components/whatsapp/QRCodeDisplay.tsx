
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  qrCode: string | null;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isBase64Image, setIsBase64Image] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrCode) {
      setError("QR Code não disponível");
      return;
    }

    setError(null);

    try {
      // Verifica se o QR code é uma imagem em base64 ou um texto
      if (qrCode.startsWith("data:image")) {
        // É uma imagem completa com prefixo
        setIsBase64Image(true);
        setQrValue(qrCode);
      } else if (/^[A-Za-z0-9+/=]+$/.test(qrCode) && qrCode.length > 100) {
        // Parece ser base64 sem o prefixo
        setIsBase64Image(true);
        setQrValue(`data:image/png;base64,${qrCode}`);
      } else {
        // É um valor de texto para gerar QR Code
        setIsBase64Image(false);
        setQrValue(qrCode);
      }
    } catch (e) {
      console.error("Erro ao processar QR code:", e);
      setError("Erro ao processar o QR code. Tente atualizar.");
    }
  }, [qrCode]);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6 mx-auto flex justify-center items-center mb-6 max-w-xs">
      {isBase64Image ? (
        <img 
          src={qrValue || ''} 
          alt="Escaneie este QR Code com o WhatsApp" 
          className="max-w-full h-auto"
          onError={() => {
            setError("Erro ao carregar a imagem do QR code. Tente atualizar.");
            console.error("Failed to load QR code image:", qrValue);
          }}
        />
      ) : (
        qrValue && (
          <QRCode
            size={200}
            value={qrValue}
            viewBox={`0 0 200 200`}
          />
        )
      )}
    </Card>
  );
}
