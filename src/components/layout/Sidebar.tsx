import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquarePlus,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
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
    <div className="flex h-full flex-col gap-6">
      <div className="flex h-[80px] items-center justify-center px-6">
        <img src="/elia.png" alt="Logo" className="h-12 w-auto" />
      </div>

      <nav className="flex-1 space-y-2 px-4">
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

      <div className="p-4">
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