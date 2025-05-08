
import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Sidebar from "./Sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

const Layout = () => {
  const isMobile = useIsMobile()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <>
          <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-40 px-4 flex items-center shadow-sm">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                <Sidebar onNavItemClick={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <main className="pt-20 px-4 pb-4 min-h-[calc(100vh-5rem)]">
            <Outlet />
          </main>
        </>
      ) : (
        <>
          <div className="fixed inset-y-0 left-0 w-72 border-r bg-background shadow-sm z-30">
            <Sidebar />
          </div>
          <div className="pl-72">
            <main className="container py-8 min-h-screen">
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
