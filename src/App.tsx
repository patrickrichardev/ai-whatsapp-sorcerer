
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Index from "./pages/Index"
import CreateAssistant from "./pages/CreateAssistant"
import ConnectWhatsApp from "./pages/ConnectWhatsApp"
import WhatsAppQR from "./pages/WhatsAppQR"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import LiveChat from "./pages/LiveChat"
import SelectAgent from "./pages/SelectAgent"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import { ThemeProvider } from "./components/theme/ThemeProvider"

function App() {
  return (
    <Router>
      <ThemeProvider>
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
              <Route path="live-chat" element={<LiveChat />} />
              <Route path="create-assistant" element={<CreateAssistant />} />
              <Route path="select-agent" element={<SelectAgent />} />
              <Route path="connect-whatsapp" element={<ConnectWhatsApp />} />
              <Route path="connect-whatsapp/qr" element={<WhatsAppQR />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
