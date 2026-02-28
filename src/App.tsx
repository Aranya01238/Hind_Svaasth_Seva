import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import AdminPortal from "./pages/AdminPortal";
import ReceptionistPortal from "./pages/ReceptionistPortal";
import PatientPortal from "./pages/PatientPortal";
import EmergencyPortal from "./pages/EmergencyPortal";
import DeveloperPortal from "./pages/DeveloperPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist"
                element={
                  <ProtectedRoute>
                    <ReceptionistPortal />
                  </ProtectedRoute>
                }
              />
              <Route path="/patient" element={<PatientPortal />} />
              <Route path="/emergency" element={<EmergencyPortal />} />
              <Route path="/developer" element={<DeveloperPortal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
