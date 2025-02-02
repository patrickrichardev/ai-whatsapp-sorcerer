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

export default function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()

  const isCurrentPath = (path: string) => {
    return location.pathname === path
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: isCurrentPath("/"),
    },
    {
      name: "Criar Assistente",
      href: "/create-assistant",
      icon: MessageSquarePlus,
      current: isCurrentPath("/create-assistant"),
    },
    {
      name: "Conectar WhatsApp",
      href: "/connect-whatsapp",
      icon: MessageSquare,
      current: isCurrentPath("/connect-whatsapp"),
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
      current: isCurrentPath("/settings"),
    },
  ]

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center px-6">
        <img src="/elia.png" alt="Logo" className="h-8 w-auto" />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => (
          <Link key={item.name} to={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                item.current && "bg-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}