
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Smartphone,
  PenTool
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { UserProfileBox } from "./UserProfileBox"
import { motion } from "framer-motion"

interface SidebarProps {
  onNavItemClick?: () => void;
}

const navigation = [
  {
    name: "Início",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Assistente de Conteúdo",
    href: "/content-assistant",
    icon: PenTool,
    highlight: true,
  },
  {
    name: "Dispositivos",
    href: "/devices",
    icon: Smartphone,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar({ onNavItemClick }: SidebarProps) {
  const location = useLocation()
  const { signOut } = useAuth()

  const isCurrentPath = (path: string) => location.pathname === path

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center justify-center px-6 border-b">
        <motion.img 
          src="/elia.png" 
          alt="Logo" 
          className="h-8 w-auto" 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20 
          }}
          whileHover={{ scale: 1.05 }}
        />
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-3">
          {navigation.map((item) => {
            const isActive = isCurrentPath(item.href);
            return (
              <Link 
                key={item.name} 
                to={item.href} 
                onClick={onNavItemClick}
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-base py-6",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-foreground/80 hover:text-foreground",
                      item.highlight && !isActive && "border-l-2 border-primary/30"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", item.highlight && !isActive && "text-primary/70")} />
                    {item.name}
                    {item.highlight && !isActive && (
                      <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        Novo
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t bg-muted/30 flex flex-col">
        <UserProfileBox />
        
        <div className="p-3 space-y-2">
          <ThemeToggle className="w-full justify-start" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base py-5 text-destructive/80 hover:text-destructive hover:bg-destructive/5"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
