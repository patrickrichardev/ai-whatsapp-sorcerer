
interface QRCodeDisplayProps {
  qrCode: string | null;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  if (!qrCode) return null;
  
  return (
    <div className="aspect-square max-w-[300px] mx-auto mb-6 bg-white p-4 rounded-lg">
      <img
        src={`data:image/png;base64,${qrCode}`}
        alt="WhatsApp QR Code"
        className="w-full h-full"
      />
    </div>
  );
}
