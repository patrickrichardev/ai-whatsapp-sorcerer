
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquarePlus,
  MessageSquare,
  Settings,
  LogOut,
  MessagesSquare,
  Bot,
  Smartphone
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Chat Ao Vivo",
    href: "/live-chat",
    icon: MessagesSquare,
  },
  {
    name: "Meus Agentes",
    href: "/create-assistant",
    icon: Bot,
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

export default function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()

  const isCurrentPath = (path: string) => location.pathname === path

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center justify-center px-6 border-b">
        <img src="/elia.png" alt="Logo" className="h-8 w-auto" />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-base py-5",
                  isCurrentPath(item.href) ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-3 space-y-2 bg-muted/30">
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
  )
}
