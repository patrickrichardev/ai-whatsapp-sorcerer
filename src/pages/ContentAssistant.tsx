
import { useState } from "react"
import AIChat from "@/components/chat/AIChat"

export default function ContentAssistant() {
  const [isMenuOpen, setIsMenuOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar do Assistente */}
      <div className={`bg-card border-r w-72 transition-all duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-20 h-full`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Assistentes IA</h2>
        </div>
        <div className="p-2">
          <div className="rounded-md bg-primary/10 p-3 cursor-pointer">
            <div className="font-medium text-primary">Criação de Conteúdo</div>
            <div className="text-xs text-muted-foreground mt-1">
              Especialista em textos envolventes e estratégias de conteúdo
            </div>
          </div>
          {/* Espaço para adicionar mais assistentes no futuro */}
          <div className="rounded-md hover:bg-muted p-3 cursor-pointer mt-2">
            <div className="font-medium">Marketing Digital</div>
            <div className="text-xs text-muted-foreground mt-1">
              Em breve
            </div>
          </div>
          <div className="rounded-md hover:bg-muted p-3 cursor-pointer mt-2">
            <div className="font-medium">SEO</div>
            <div className="text-xs text-muted-foreground mt-1">
              Em breve
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col h-screen">
        <header className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Assistente de Criação de Conteúdo</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Conversas são resetadas após 24 horas
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <AIChat />
        </div>
      </div>
    </div>
  )
}
