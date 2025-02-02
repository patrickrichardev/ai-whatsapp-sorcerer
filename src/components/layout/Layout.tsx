import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <div className={`${isMobile ? 'hidden md:block' : ''} fixed left-0 top-0 h-full w-72 border-r border-white/10`}>
        <Sidebar />
      </div>
      <main className={`${isMobile ? 'px-4' : 'pl-72'} p-8 transition-all duration-200`}>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;