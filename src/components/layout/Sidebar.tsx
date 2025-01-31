import { Home, Plus, MessageSquare, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
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
          Create Assistant
        </NavLink>
        <NavLink to="/connect" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          WhatsApp Connect
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;