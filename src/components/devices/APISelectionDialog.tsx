
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, QrCode } from "lucide-react"
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
  const [selectedOption, setSelectedOption] = useState<'official' | 'non-official' | null>(null)

  const handleContinue = () => {
    if (selectedOption === 'non-official') {
      onSelectNonOfficial()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione o tipo de API</DialogTitle>
          <DialogDescription>
            Escolha qual tipo de API deseja utilizar para conectar seu dispositivo WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedOption === 'official' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedOption('official')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">API Oficial</h3>
              <p className="text-sm text-muted-foreground">
                Conexão oficial com WhatsApp Business API
              </p>
              <div className="mt-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                Em breve
              </div>
            </div>
          </div>

          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedOption === 'non-official' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedOption('non-official')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-primary/10 p-3 rounded-lg">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">API Não Oficial</h3>
              <p className="text-sm text-muted-foreground">
                Conexão via QR Code com WhatsApp Web
              </p>
              <div className="mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Disponível
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={selectedOption !== 'non-official'}
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
