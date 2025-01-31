import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Smartphone } from "lucide-react";

const ConnectWhatsApp = () => {
  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Conectar Whatsapp</h1>
      
      <Card className="glass-card p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Conectar Seu Whatsapp</h2>
          <p className="text-muted-foreground mb-6">
            Escaneie o código QR com o WhatsApp para conectar sua conta
          </p>
        </div>

        <div className="glass-card aspect-square max-w-[300px] mx-auto mb-6 flex items-center justify-center">
          <QrCode className="w-16 h-16 text-muted-foreground" />
        </div>

        <Button variant="outline" className="mx-auto">
          Atualizar QR Code
        </Button>
      </Card>
    </div>
  );
};

export default ConnectWhatsApp;
