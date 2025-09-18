import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Properties from "./pages/Properties"
import Agents from "./pages/Agents"
import UserManagement from "./pages/UserManagement"
import ProtectedRoute from "./components/ProtectedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/onboarding" 
              element={
                <AuthenticatedRoute>
                  <Onboarding />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <AuthenticatedRoute>
                  <Navigate to="/dashboard" replace />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/properties" 
              element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              } 
            />
            {/* <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold">Clients</h1>
                    <p className="text-muted-foreground mt-2">Client management coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            /> */}
            <Route 
              path="/agents" 
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <Agents />
                </ProtectedRoute>
              } 
            />
            {/* <Route 
              path="/tasks" 
              element={
                <ProtectedRoute roles={['agent', 'manager']}>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground mt-2">Task management coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            /> */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground mt-2">Analytics dashboard coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/performance" 
              element={
                <ProtectedRoute roles={['agent']}>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold">Performance</h1>
                    <p className="text-muted-foreground mt-2">Performance metrics coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold">Reports</h1>
                    <p className="text-muted-foreground mt-2">Reports dashboard coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-2">Settings panel coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
