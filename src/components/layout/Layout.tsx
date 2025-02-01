import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 p-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;