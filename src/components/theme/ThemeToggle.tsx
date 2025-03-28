
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./ThemeProvider"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={className}
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 mr-2" />
      ) : (
        <Moon className="h-5 w-5 mr-2" />
      )}
      {theme === "light" ? "Modo Escuro" : "Modo Claro"}
    </Button>
  )
}
