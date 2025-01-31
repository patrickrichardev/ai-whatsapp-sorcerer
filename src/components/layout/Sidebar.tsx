import { Home, Plus, MessageSquare, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Sidebar = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-black/20 border-r border-white/10 p-4">
      <div className="flex items-center gap-2 px-4 mb-8">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500" />
        <h1 className="text-xl font-bold">AI Assistant</h1>
      </div>
      
      <nav className="space-y-2">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Plus size={20} />
          Criar Assistente
        </NavLink>
        <NavLink to="/connect" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          Conectar WhatsApp
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          Configurações
        </NavLink>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
          onClick={handleSignOut}
        >
          <LogOut size={20} className="mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;