import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Index from "./pages/Index"
import CreateAssistant from "./pages/CreateAssistant"
import ConnectWhatsApp from "./pages/ConnectWhatsApp"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Index />} />
            <Route path="create-assistant" element={<CreateAssistant />} />
            <Route path="connect-whatsapp" element={<ConnectWhatsApp />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App