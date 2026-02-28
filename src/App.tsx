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
import ReceptionistDashboard from "./pages/receptionist/Dashboard";
import ReceptionistPatients from "./pages/receptionist/Patients";
import ReceptionistAppointments from "./pages/receptionist/Appointments";
import ReceptionistDoctors from "./pages/receptionist/Doctors";
import ReceptionistSchedule from "./pages/receptionist/Schedule";
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
                  <ProtectedRoute requiredRole="super_admin">
                    <AdminPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist"
                element={
                  <ProtectedRoute requiredRole="receptionist">
                    <ReceptionistPortal />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ReceptionistDashboard />} />
                <Route path="patients" element={<ReceptionistPatients />} />
                <Route
                  path="appointments"
                  element={<ReceptionistAppointments />}
                />
                <Route path="doctors" element={<ReceptionistDoctors />} />
                <Route path="schedule" element={<ReceptionistSchedule />} />
              </Route>
              <Route
                path="/patient"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <PatientPortal />
                  </ProtectedRoute>
                }
              />
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
