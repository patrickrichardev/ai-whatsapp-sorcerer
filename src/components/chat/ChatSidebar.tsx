
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileText, Folder, HelpCircle, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { useAuth } from "@/contexts/AuthContext"
import { AnimatePresence, motion } from "framer-motion"

interface ChatSidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const ChatSidebar = ({ isMenuOpen, setIsMenuOpen }: ChatSidebarProps) => {
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
          </div>
          
          <div className="p-3 border-b">
            <div className="flex flex-col space-y-2">
              <Button variant="outline" size="sm" className="justify-start gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="truncate">Minhas Criações</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start gap-2">
                <Folder className="h-4 w-4 text-amber-500" />
                <span className="truncate">Briefings</span>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <span>Como usar</span>
              </Button>
            </div>
          </div>
          
          <div className="flex-1"></div>

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
