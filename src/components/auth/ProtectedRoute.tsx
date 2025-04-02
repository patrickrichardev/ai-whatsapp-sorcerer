
import { useAuth } from "@/contexts/AuthContext"
import { Navigate, useLocation } from "react-router-dom"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log("ProtectedRoute - User:", user, "Loading:", loading)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    console.log("No user found, redirecting to login")
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
