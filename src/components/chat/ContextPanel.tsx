
import { useState } from "react"
import { motion } from "framer-motion"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Business sectors
const sectors = [
  "Moda", "Saúde", "Estética", "Fitness", "Marketing", 
  "Tecnologia", "Educação", "Alimentação", "Finanças", "Imobiliário"
]

// Voice tones
const tones = [
  "Informal", "Profissional", "Inspirador", "Polêmico", 
  "Divertido", "Sério", "Motivacional", "Minimalista"
]

// Content types
const contentTypes = [
  "Educativo", "Engraçado", "Vendas", "Informativo", 
  "Storytelling", "Tutorial", "Depoimento", "Curiosidade"
]

// Target audiences
const audiences = [
  "Mulheres 25+", "Homens 30+", "Jovens adultos", "Empreendedores", 
  "Profissionais de saúde", "Estudantes", "Pais e mães", "Empresários"
]

interface ContextPanelProps {
  onClose: () => void;
}

export default function ContextPanel({ onClose }: ContextPanelProps) {
  const [selectedSector, setSelectedSector] = useState<string | null>("Saúde")
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-64 border-l bg-card/80 backdrop-blur-sm z-20 flex flex-col h-full p-4 overflow-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Configurações</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={onClose}
        >
          <PanelLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>

      <div className="space-y-5">
        {/* Sector selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Setor</label>
          <div className="space-y-1">
            {sectors.slice(0, 8).map(sector => (
              <Button 
                key={sector}
                size="sm" 
                variant="ghost"
                className={cn(
                  "justify-start w-full h-8", 
                  selectedSector === sector ? "bg-primary/10 text-primary" : ""
                )}
                onClick={() => setSelectedSector(sector === selectedSector ? null : sector)}
              >
                {sector}
              </Button>
            ))}
          </div>
        </div>

        {/* Voice tone selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tom de voz</label>
          <div className="space-y-1">
            {tones.slice(0, 6).map(tone => (
              <Button 
                key={tone}
                size="sm" 
                variant="ghost"
                className={cn(
                  "justify-start w-full h-8", 
                  selectedTone === tone ? "bg-primary/10 text-primary" : ""
                )}
                onClick={() => setSelectedTone(tone === selectedTone ? null : tone)}
              >
                {tone}
              </Button>
            ))}
          </div>
        </div>

        {/* Target audience selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Público-alvo</label>
          <div className="space-y-1">
            {audiences.slice(0, 6).map(audience => (
              <Button 
                key={audience}
                size="sm" 
                variant="ghost"
                className={cn(
                  "justify-start w-full h-8", 
                  selectedAudience === audience ? "bg-primary/10 text-primary" : ""
                )}
                onClick={() => setSelectedAudience(audience === selectedAudience ? null : audience)}
              >
                {audience}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="text-xs text-muted-foreground mb-2">
          Configurações selecionadas:
        </div>
        <div className="space-y-1 text-sm">
          <p>{selectedSector ? `• Setor: ${selectedSector}` : '• Setor: Não definido'}</p>
          <p>{selectedTone ? `• Tom: ${selectedTone}` : '• Tom: Não definido'}</p>
          <p>{selectedContentType ? `• Tipo: ${selectedContentType}` : '• Tipo: Não definido'}</p>
          <p>{selectedAudience ? `• Público: ${selectedAudience}` : '• Público: Não definido'}</p>
        </div>
      </div>

      <div className="mt-auto">
        <div className="bg-primary/5 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">
            ⚠️ Estas configurações serão enviadas como contexto para a IA gerar conteúdo mais relevante.
          </p>
          <Button className="w-full" size="sm">
            Aplicar configurações
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
