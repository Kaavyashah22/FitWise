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
import AppNavigation from "./components/AppNavigation";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

function MainLayout({ children, noPadding = false }: { children: React.ReactNode, noPadding?: boolean }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-zinc-950 relative">
      <AppNavigation />
      <main className={cn(
        "flex-1 w-full max-w-7xl mx-auto flex flex-col transition-all duration-300",
        // Desktop: top padding for TopNav. Mobile: bottom padding for BottomTabBar
        "pt-4 md:pt-28 pb-28 md:pb-6", 
        noPadding ? "h-[100dvh] overflow-hidden !max-w-none !px-0" : "px-4 md:px-8 overflow-auto"
      )}>
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