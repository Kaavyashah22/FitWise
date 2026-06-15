import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CoachPage from "./pages/CoachPage";
import AppSidebar from "./components/AppSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function MainLayout({ children, noPadding = false }: { children: React.ReactNode, noPadding?: boolean }) {
  return (
    <div className="min-h-screen flex bg-zinc-950">
      <AppSidebar />
      <main className={`flex-1 md:ml-64 mt-14 md:mt-0 ${noPadding ? 'h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden' : 'p-6 lg:p-8 overflow-auto'}`}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/workouts" element={<MainLayout><WorkoutsPage /></MainLayout>} />
        <Route path="/analytics" element={<MainLayout><AnalyticsPage /></MainLayout>} />
        <Route path="/coach" element={<MainLayout noPadding><CoachPage /></MainLayout>} />
      </Route>
      
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
}

function App() {
  // Wake up backend when frontend loads
  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;