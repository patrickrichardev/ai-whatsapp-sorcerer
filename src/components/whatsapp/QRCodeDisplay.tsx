
interface QRCodeDisplayProps {
  qrCode: string | null;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  if (!qrCode) return null;
  
  return (
    <div className="aspect-square max-w-[300px] mx-auto mb-6 bg-white p-4 rounded-lg">
      <img
        src={qrCode.includes("data:image") ? qrCode : `data:image/png;base64,${qrCode}`}
        alt="WhatsApp QR Code"
        className="w-full h-full"
        onError={(e) => {
          console.error("Failed to load QR code image");
          (e.target as HTMLImageElement).style.display = 'none';
          const fallback = document.createElement('div');
          fallback.className = "p-4 text-red-500 text-center";
          fallback.textContent = "Erro ao exibir QR code. Tente atualizar.";
          (e.target as HTMLElement).parentNode?.appendChild(fallback);
        }}
      />
    </div>
  );
}
