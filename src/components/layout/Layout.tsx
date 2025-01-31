import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 p-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;