
interface QRCodeDisplayProps {
  qrCode: string | null;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  if (!qrCode) {
    return (
      <div className="aspect-square max-w-[300px] mx-auto mb-6 bg-gray-100 p-4 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">QR Code não disponível</p>
      </div>
    );
  }
  
  // Processar o QR code para garantir que esteja no formato correto
  // Verificamos se já é um data URL ou se precisamos adicionar o prefixo
  const qrSrc = qrCode.startsWith('data:') 
    ? qrCode 
    : `data:image/png;base64,${qrCode}`;
  
  console.log("Renderizando QR code com comprimento:", qrSrc.length);
  
  return (
    <div className="aspect-square max-w-[300px] mx-auto mb-6 bg-white p-4 rounded-lg">
      <img
        src={qrSrc}
        alt="WhatsApp QR Code"
        className="w-full h-full"
        onError={(e) => {
          console.error("Falha ao carregar imagem do QR code");
          console.error("Dados do QR code (primeiros 50 caracteres):", qrSrc.substring(0, 50));
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
