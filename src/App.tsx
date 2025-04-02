import { createContext, Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Layout } from "@/components/layout/Layout";
import Index from "@/pages/Index";
import { useTheme } from "@/hooks/useTheme";

// Lazy load components
const Login = lazy(() => import("@/pages/Login"));
const CreateAssistant = lazy(() => import("@/pages/CreateAssistant"));
const LiveChat = lazy(() => import("@/pages/LiveChat"));
const WhatsAppQR = lazy(() => import("@/pages/WhatsAppQR"));
const Devices = lazy(() => import("@/pages/Devices"));
const WhatsAppConnect = lazy(() => import("@/pages/WhatsAppConnect"));

export const SupabaseContext = createContext(null);

function App() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    setSupabaseClient(
      createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
    );
  }, []);

  return (
    <ThemeProvider>
      <div
        className="min-h-screen bg-background font-sans antialiased"
        data-theme={theme}
      >
        <SupabaseContext.Provider value={supabaseClient}>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/login"
                element={
                  <Suspense fallback={<div>Carregando...</div>}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Carregando...</div>}>
                        <CreateAssistant />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Carregando...</div>}>
                        <LiveChat />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/whatsapp"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Carregando...</div>}>
                        <WhatsAppQR />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/devices"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Carregando...</div>}>
                        <Devices />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/whatsapp-connect"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Carregando...</div>}>
                        <WhatsAppConnect />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Carregando...</div>}>
                        <Settings />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </SupabaseContext.Provider>
        <Toaster />
        <SonnerToaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
