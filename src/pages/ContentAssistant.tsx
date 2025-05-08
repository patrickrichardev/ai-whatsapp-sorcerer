
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { 
  FileText, 
  Folder, 
  HelpCircle, 
  PanelLeft, 
  Moon, 
  Sun, 
  LogOut,
  Calendar,
  Image,
  Mic,
  Send,
  Pen,
  Video,
  BadgeCheck,
  LayoutGrid,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme/ThemeProvider"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import SocialContentChat from "@/components/chat/SocialContentChat"

// Quick command suggestions
const quickCommands = [
  { icon: <Pen className="h-4 w-4" />, label: "Criar legenda para Instagram" },
  { icon: <Video className="h-4 w-4" />, label: "Ideia de roteiro para Reels" },
  { icon: <Calendar className="h-4 w-4" />, label: "Calendário de postagens" },
  { icon: <LayoutGrid className="h-4 w-4" />, label: "Criar carrossel educativo" },
  { icon: <BadgeCheck className="h-4 w-4" />, label: "Sugestão de copy para anúncio" },
]

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

export default function ContentAssistant() {
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [isContextOpen, setIsContextOpen] = useState(true)
  const { theme, setTheme } = useTheme()
  const { signOut, user } = useAuth()
  const [inputValue, setInputValue] = useState("")
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // In a real app, this would send the message with context
      console.log({
        message: inputValue,
        context: {
          sector: selectedSector,
          tone: selectedTone,
          contentType: selectedContentType,
          audience: selectedAudience
        }
      })
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Menu Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-card border-r w-72 fixed md:relative z-30 h-full shadow-lg flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/elia.png" />
                  <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">Social Content Pro</h2>
                  <p className="text-xs text-muted-foreground">Assistente de conteúdo</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-3 border-b">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 justify-start gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate">Minhas Criações</span>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 justify-start gap-2">
                  <Folder className="h-4 w-4 text-amber-500" />
                  <span className="truncate">Briefings</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 mt-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <span>Como usar</span>
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-3 space-y-3">
              <div className="rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 p-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-primary/20">
                <div className="font-medium text-primary flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  <span>Criação de Conteúdo</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Especialista em textos envolventes e estratégias de conteúdo
                </div>
              </div>
              
              <div className="rounded-lg hover:bg-muted p-3 cursor-pointer transition-all duration-200 border border-transparent hover:border-border">
                <div className="font-medium flex items-center opacity-70 space-x-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
                  <span>Marketing Digital</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 opacity-70">
                  Em breve
                </div>
              </div>
              
              <div className="rounded-lg hover:bg-muted p-3 cursor-pointer transition-all duration-200 border border-transparent hover:border-border">
                <div className="font-medium flex items-center opacity-70 space-x-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
                  <span>SEO</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 opacity-70">
                  Em breve
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Sugestões de prompt</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted">
                    "Crie um post sobre os benefícios do produto X para o Instagram"
                  </div>
                  <div className="p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted">
                    "Preciso de 5 ideias de conteúdo para engajar minha audiência"
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto w-full border-t p-3 space-y-2 bg-muted/20">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <><Moon className="h-4 w-4" /> Modo Escuro</>
                ) : (
                  <><Sun className="h-4 w-4" /> Modo Claro</>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start gap-2 text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <div className="flex-1 flex h-screen overflow-hidden">
        {/* Header - Fixed */}
        <header className="border-b p-3 flex justify-between items-center bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm h-16 w-full absolute">
          <div className="flex items-center space-x-2">
            {!isMenuOpen && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="hover:bg-primary/5"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">Social Content Pro</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
              Assistente de mídias sociais
            </div>
          </div>
        </header>
        
        {/* Context Sidebar - Right */}
        <AnimatePresence>
          {isContextOpen && (
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
                  onClick={() => setIsContextOpen(false)}
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
          )}
        </AnimatePresence>
        
        {/* Main Chat Container */}
        <div className="flex-1 flex flex-col h-screen pt-16">
          {/* Quick commands */}
          <div className="px-4 py-3 border-b overflow-x-auto">
            <div className="flex space-x-2">
              {quickCommands.map((command, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  className="whitespace-nowrap"
                  onClick={() => setInputValue(command.label)}
                >
                  {command.icon}
                  <span>{command.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="flex-1 overflow-hidden">
            <SocialContentChat />
          </div>
          
          {/* Input area */}
          <div className="border-t bg-card/50 backdrop-blur-sm p-4 sticky bottom-0">
            <div className="max-w-4xl mx-auto flex flex-col">
              <div className="flex items-end gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Descreva o conteúdo que você precisa..."
                  className="min-h-[60px] max-h-[200px] flex-1 resize-none overflow-auto rounded-xl"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl h-8 w-8"
                    onClick={() => !isContextOpen && setIsContextOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="rounded-xl h-8 w-8"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  AI Social Content Pro | v1.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
