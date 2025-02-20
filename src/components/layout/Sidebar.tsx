
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
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

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
    name: "Criar Assistente",
    href: "/create-assistant",
    icon: MessageSquarePlus,
  },
  {
    name: "Conectar Agente",
    href: "/connect-whatsapp",
    icon: MessageSquare,
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
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-16 items-center justify-center px-6 border-b">
        <img src="/elia.png" alt="Logo" className="h-8 w-auto" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-base py-6",
                  isCurrentPath(item.href) && "bg-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-base py-6 text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}
