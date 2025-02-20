
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
        <>
          <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-40 px-4 flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label="Menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <ThemeToggle />
          </div>
          <main className="pt-16 px-4">
            <Outlet />
          </main>
        </>
      ) : (
        <>
          <div className="fixed inset-y-0 left-0 w-72 border-r bg-background">
            <Sidebar />
          </div>
          <div className="pl-72">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <main className="container py-8">
              <Outlet />
            </main>
          </div>
        </>
      )}
      <Toaster />
    </div>
  )
}

export default Layout
