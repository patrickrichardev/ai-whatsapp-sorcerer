import { Home, Plus, MessageSquare, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-black/20 border-r border-white/10 p-4">
      <div className="flex items-center px-4 mb-8">
        <img src="elia.png" alt="Logo" className="h-12" />
      </div>
      
      <nav className="space-y-2">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          Painel de Controle
        </NavLink>
        <NavLink to="/create-assistant" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Plus size={20} />
          Criar Agente
        </NavLink>
        <NavLink to="/connect-whatsapp" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
         Conectar Whatsapp
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          Configurações
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;