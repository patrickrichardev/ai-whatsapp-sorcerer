
import { useState } from "react"
import AIChat from "@/components/chat/AIChat"
import { AnimatePresence, motion } from "framer-motion"
import { PanelLeft, Moon, Sun, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme/ThemeProvider"
import { useAuth } from "@/contexts/AuthContext"

export default function ContentAssistant() {
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar do Assistente */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-card border-r w-72 fixed md:relative z-20 h-full shadow-lg flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Assistentes IA</h2>
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-2 space-y-2 mt-2 flex-1 overflow-auto">
              <div className="rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-primary/20">
                <div className="font-medium text-primary flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  <span>Criação de Conteúdo</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Especialista em textos envolventes e estratégias de conteúdo
                </div>
              </div>
              
              <div className="rounded-lg hover:bg-muted p-4 cursor-pointer mt-2 transition-all duration-200 border border-transparent hover:border-border">
                <div className="font-medium flex items-center opacity-70 space-x-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
                  <span>Marketing Digital</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 opacity-70">
                  Em breve
                </div>
              </div>
              
              <div className="rounded-lg hover:bg-muted p-4 cursor-pointer mt-2 transition-all duration-200 border border-transparent hover:border-border">
                <div className="font-medium flex items-center opacity-70 space-x-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
                  <span>SEO</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 opacity-70">
                  Em breve
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
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col h-screen">
        <header className="border-b p-4 flex justify-between items-center bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
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
            <h1 className="text-xl font-semibold">Assistente de Criação de Conteúdo</h1>
          </div>
          <div className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
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
