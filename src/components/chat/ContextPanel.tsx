
import { useState } from "react"
import { motion } from "framer-motion"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-64 border-l bg-card/80 backdrop-blur-sm z-20 flex flex-col h-full p-4 overflow-auto flex-shrink-0"
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

      <div className="space-y-4">
        {/* Sector selection */}
        <div>
          <label className="text-sm font-medium mb-1 block">Setor</label>
          <div className="flex flex-wrap gap-1.5">
            {sectors.slice(0, 6).map(sector => (
              <Button 
                key={sector}
                size="sm" 
                variant={selectedSector === sector ? "default" : "outline"}
                className="text-xs h-7 px-2"
                onClick={() => setSelectedSector(sector === selectedSector ? null : sector)}
              >
                {sector}
              </Button>
            ))}
          </div>
        </div>

        {/* Voice tone selection */}
        <div>
          <label className="text-sm font-medium mb-1 block">Tom de voz</label>
          <div className="flex flex-wrap gap-1.5">
            {tones.slice(0, 6).map(tone => (
              <Button 
                key={tone}
                size="sm" 
                variant={selectedTone === tone ? "default" : "outline"}
                className="text-xs h-7 px-2"
                onClick={() => setSelectedTone(tone === selectedTone ? null : tone)}
              >
                {tone}
              </Button>
            ))}
          </div>
        </div>

        {/* Content type selection */}
        <div>
          <label className="text-sm font-medium mb-1 block">Tipo de conteúdo</label>
          <div className="flex flex-wrap gap-1.5">
            {contentTypes.slice(0, 6).map(type => (
              <Button 
                key={type}
                size="sm" 
                variant={selectedContentType === type ? "default" : "outline"}
                className="text-xs h-7 px-2"
                onClick={() => setSelectedContentType(type === selectedContentType ? null : type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Target audience selection */}
        <div>
          <label className="text-sm font-medium mb-1 block">Público-alvo</label>
          <div className="flex flex-wrap gap-1.5">
            {audiences.slice(0, 6).map(audience => (
              <Button 
                key={audience}
                size="sm" 
                variant={selectedAudience === audience ? "default" : "outline"}
                className="text-xs h-7 px-2"
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
