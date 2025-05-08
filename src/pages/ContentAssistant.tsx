
import { useState } from "react"
import { Search, Mic, Send, FileText, Save, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Define category types
type SectorType = "Moda" | "Saúde" | "Estética" | "Fitness" | "Marketing" | "Tecnologia" | "Educação" | "Alimentação";
type ToneType = "Informal" | "Profissional" | "Inspirador" | "Polêmico" | "Divertido" | "Sério";
type AudienceType = "Mulheres 25+" | "Donas de loja" | "Nutris" | "Jovens adultos" | "Profissionais" | "Estudantes";

// Main content suggestions
const contentSuggestions = [
  {
    icon: "✏️",
    title: "Criar legenda para Instagram",
    command: "criar legenda instagram"
  },
  {
    icon: "🎬",
    title: "Ideia de roteiro para Reels",
    command: "roteiro reels"
  },
  {
    icon: "📅",
    title: "Calendário de postagens",
    command: "calendário postagens"
  },
  {
    icon: "✨",
    title: "Sugestão de copy para anúncio",
    command: "copy anúncio"
  }
];

export default function ContentAssistant() {
  // State management
  const [inputValue, setInputValue] = useState("")
  const [selectedSector, setSelectedSector] = useState<SectorType | null>("Saúde")
  const [selectedTone, setSelectedTone] = useState<ToneType | null>(null)
  const [selectedAudience, setSelectedAudience] = useState<AudienceType | null>(null)
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: "Poderia criar uma legenda para um post sobre dicas de skincare?"
    },
    {
      role: "assistant",
      content: "Claro! Aqui está uma legenda para um post sobre dicas de skincare:\n\n😊💚 Lembre-se, a consistência é fundamental para resultados duruosas. Experimente e descubra o que func-iona melhor para a sua pele!\n#skincare #dicasdebeleza #cuidadoscomapele"
    }
  ])
  
  // Template sectors, tones, and audience
  const sectors: SectorType[] = ["Moda", "Saúde", "Estética", "Fitness", "Marketing", "Tecnologia", "Educação", "Alimentação"]
  const tones: ToneType[] = ["Informal", "Profissional", "Inspirador", "Polêmico", "Divertido", "Sério"]
  const audiences: AudienceType[] = ["Mulheres 25+", "Donas de loja", "Nutris", "Jovens adultos", "Profissionais", "Estudantes"]

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    
    // In a real app, you would send this to an API
    setMessages([...messages, { role: "user", content: inputValue }])
    setInputValue("")
    
    // For demo purposes
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Claro! Aqui está uma legenda para um post sobre dicas de skincare:\n\n😊💚 Lembre-se, a consistência é fundamental para resultados duruosas. Experimente e descubra o que func-iona melhor para a sua pele!\n#skincare #dicasdebeleza #cuidadoscomapele"
      }])
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-card/50 backdrop-blur-sm z-30 flex items-center px-4 md:px-6">
        <h1 className="text-xl font-semibold mr-auto">Social Content Pro</h1>
        <nav className="hidden md:flex items-center space-x-8">
          <Button variant="ghost">Minhas Criações</Button>
          <Button variant="ghost">Briefings Salvos</Button>
          <Button variant="ghost">Como usar</Button>
        </nav>
        <Button variant="ghost" size="icon" className="ml-4">
          <Search className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex w-full pt-16">
        {/* Left Sidebar - Settings */}
        <div className="w-72 border-r h-[calc(100vh-4rem)] overflow-y-auto p-5 space-y-6 bg-background hidden md:block">
          <div>
            <h3 className="font-medium mb-3">Setor</h3>
            <div className="space-y-1">
              {sectors.map(sector => (
                <Button 
                  key={sector} 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start text-left h-9",
                    selectedSector === sector ? "bg-primary/10 text-primary" : ""
                  )}
                  onClick={() => setSelectedSector(sector === selectedSector ? null : sector)}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Tom de voz</h3>
            <div className="space-y-1">
              {tones.map(tone => (
                <Button 
                  key={tone} 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start text-left h-9",
                    selectedTone === tone ? "bg-primary/10 text-primary" : ""
                  )}
                  onClick={() => setSelectedTone(tone === selectedTone ? null : tone)}
                >
                  {tone}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Público-alvo</h3>
            <div className="space-y-1">
              {audiences.map(audience => (
                <Button 
                  key={audience} 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start text-left h-9",
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          {/* Content Type Buttons */}
          <div className="p-4 flex space-x-2 overflow-x-auto">
            {contentSuggestions.map((suggestion, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="whitespace-nowrap"
                onClick={() => setInputValue(suggestion.command)}
              >
                <span className="mr-2">{suggestion.icon}</span>
                {suggestion.title}
              </Button>
            ))}
          </div>

          <Separator />

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`max-w-3xl ${message.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div className={`p-4 rounded-xl ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground ml-12" 
                    : "bg-card border"
                }`}>
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar - Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
            <div className="w-72 border-l h-full bg-background hidden lg:block p-5 overflow-y-auto">
              <h3 className="font-medium mb-4">Suggerstões</h3>
              <div className="bg-card p-4 rounded-lg border mb-4">
                <p className="text-sm">
                  😊💚 Lembre-se: a consistencia é fundamental para resultados duraduross. Experimente e descubra o que funciona melhor para a sua pele! ✨
                </p>
                <p className="text-sm mt-2">
                  #shincare #dicasdebele2 a #cuidadoscom aele
                </p>
                <div className="flex space-x-2 mt-4">
                  <Button size="sm" className="bg-primary">Copiar</Button>
                  <Button size="sm" variant="outline">Editar</Button>
                  <Button size="sm" variant="outline">Salvar</Button>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 bg-card/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex items-end gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Poderia criar uma legenda para um post sobre dicas de skincare?"
                className="min-h-[50px] resize-none rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="rounded-full h-10 w-10"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
