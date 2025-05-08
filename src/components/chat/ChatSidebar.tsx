
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileText, PlusCircle, Settings, LogOut, Moon, Sun, PanelLeft, Library, Search, Globe, Lightbulb, PlusIcon } from "lucide-react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { useAuth } from "@/contexts/AuthContext"
import { Separator } from "@/components/ui/separator"

interface ChatSidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const ChatSidebar = ({ 
  isMenuOpen = true, 
  setIsMenuOpen = () => {},
}: ChatSidebarProps) => {
  const { setTheme, theme } = useTheme()
  const { signOut } = useAuth()

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-card border-r w-64 h-full shadow-lg flex flex-col flex-shrink-0 overflow-hidden"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/elia.png" />
                <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg">Content AI</h2>
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
          
          <div className="p-3">
            <Button variant="outline" className="w-full justify-start gap-2 mb-3">
              <PlusIcon className="h-4 w-4" />
              <span>Nova conversa</span>
            </Button>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Assistentes
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 bg-primary/10">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-primary/20 text-xs">AI</AvatarFallback>
                </Avatar>
                <span>Content AI</span>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-blue-500/20 text-xs">SC</AvatarFallback>
                </Avatar>
                <span>Social Creator</span>
              </Button>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="px-3 pb-3">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
              Categorias
            </div>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <Library className="h-4 w-4 text-muted-foreground" />
                <span>Biblioteca</span>
                <span className="ml-auto text-xs text-muted-foreground">80</span>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>Explorar</span>
              </Button>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="px-3">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
              Projetos
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Meu Projeto</span>
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto"></div>

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
  );
};

export default ChatSidebar;
