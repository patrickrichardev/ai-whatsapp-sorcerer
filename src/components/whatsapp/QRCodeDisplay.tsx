import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  qrCode: string | null;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  
  useEffect(() => {
    if (qrCode) {
      // Check if qrCode already has the data URL prefix
      if (qrCode.startsWith("data:image")) {
        setQrSrc(qrCode);
      } else {
        // Otherwise, assume it's a base64 string and add the prefix
        setQrSrc(`data:image/png;base64,${qrCode}`);
      }
    } else {
      setQrSrc(null);
    }
  }, [qrCode]);

  if (!qrSrc) return null;
  
  return (
    <div className="aspect-square max-w-[300px] mx-auto mb-6 bg-white p-4 rounded-lg shadow-md">
      <img
        src={qrSrc}
        alt="WhatsApp QR Code"
        className="w-full h-full"
        onError={(e) => {
          console.error("Error loading QR code image");
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite error loop
          target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDIyQzE3LjUyMyAyMiAyMiAxNy41MjMgMjIgMTJDMjIgNi40NzcxNyAxNy41MjMgMiAxMiAyQzYuNDc3MTcgMiAyIDYuNDc3MTcgMiAxMkMyIDE3LjUyMyA2LjQ3NzE3IDIyIDEyIDIyWiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMTIgOFYxNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik04IDEySDE2IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg==";
        }}
      />
    </div>
  );
}
