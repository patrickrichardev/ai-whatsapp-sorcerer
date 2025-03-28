
import { 
  Dialog, 
  DialogContent,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

interface APISelectionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelectNonOfficial: () => void
}

export function APISelectionDialog({ 
  isOpen, 
  onOpenChange, 
  onSelectNonOfficial 
}: APISelectionDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    if (option === 'non-official') {
      onSelectNonOfficial();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background border border-border text-foreground p-0 gap-0 shadow-xl rounded-xl overflow-hidden">
        <div className="p-4 pb-2 flex items-center justify-between border-b">
          <h2 className="text-xl font-medium">Novo dispositivo</h2>
          <DialogClose className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>
        
        <div className="flex flex-col gap-3 px-4 py-3">
          {/* API Oficial - Com tag "Em breve" */}
          <div 
            className="relative bg-muted/50 rounded-lg p-4 cursor-not-allowed opacity-70"
          >
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base">API Oficial</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema de envio e pagamento direto pela plataforma do Facebook
                </p>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
              Em breve
            </div>
          </div>
          
          {/* Instagram - Em breve */}
          <div 
            className="relative bg-muted/20 rounded-lg p-4 cursor-not-allowed opacity-70"
          >
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-gradient-to-tr from-purple-600 via-pink-600 to-yellow-500 rounded-md flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.5-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-base">Instagram</h3>
                <p className="text-sm text-muted-foreground">
                  Conexão com Instagram Direct Messages
                </p>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
              Em breve
            </div>
          </div>
          
          {/* Conexão não-oficial */}
          <div 
            className={`bg-background border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/10 hover:border-primary/50 transition-colors shadow-sm ${selectedOption === 'non-official' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleSelectOption('non-official')}
          >
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-blue-500 rounded-md flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013 9.375v-4.5zM4.875 4.5a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zm1.875-.375a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zM6 6.75A.75.75 0 016.75 6h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75A.75.75 0 016 7.5v-.75zm9.75 0A.75.75 0 0116.5 6h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013 19.125v-4.5zm1.875-.375a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zm1.875-.375a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-base">Conexão não-oficial</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte escaneando o QRCODE de conexão diretamente no seu WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
