
import {
  HomeIcon,
  UsersIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink as Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedCollapseState = localStorage.getItem("sidebarCollapse");
    if (storedCollapseState) {
      setIsCollapsed(storedCollapseState === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapse", String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso!",
        description: "Você será redirecionado para a página de login.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao realizar logout",
        description: error.message,
      });
    }
  };

  return (
    <aside
      className={`bg-gray-50 border-r h-full transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between py-3 px-4">
        <span className="font-bold text-xl">
          {isCollapsed ? "AC" : "AgentCraft"}
        </span>
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className="rounded-full p-1.5"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <nav className="space-y-1 px-2">
        <Link
          to="/"
          className={({ isActive }) =>
            `flex items-center px-2 py-2 text-sm rounded-md ${
              isActive
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <HomeIcon className="mr-3 h-5 w-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/agents"
          className={({ isActive }) =>
            `flex items-center px-2 py-2 text-sm rounded-md ${
              isActive
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <UsersIcon className="mr-3 h-5 w-5" />
          <span>Agentes</span>
        </Link>

        <Link
          to="/devices"
          className={({ isActive }) =>
            `flex items-center px-2 py-2 text-sm rounded-md ${
              isActive
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          <span>Dispositivos</span>
        </Link>
        
        <Link
          to="/whatsapp-connect"
          className={({ isActive }) =>
            `flex items-center px-2 py-2 text-sm rounded-md ${
              isActive
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <MessageSquare className="mr-3 h-5 w-5" />
          <span>Conectar WhatsApp</span>
        </Link>
      </nav>

      <div className="mt-auto border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-full items-center justify-center gap-2 rounded-md px-2 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline-flex">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount>
            <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
