
import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Sidebar from "./Sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../theme/ThemeToggle"

const Layout = () => {
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="fixed top-4 left-4 z-50"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="fixed left-0 top-0 h-full w-72 border-r border-white/10">
          <Sidebar />
        </div>
      )}
      <main className={`${isMobile ? 'px-4 pt-16' : 'pl-72'} p-8 transition-all duration-200 max-w-7xl mx-auto relative`}>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}

export default Layout
