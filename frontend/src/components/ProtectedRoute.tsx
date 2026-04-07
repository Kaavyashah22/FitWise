import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading FitWise...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the child routes correctly
  return <Outlet />;
};

export default ProtectedRoute;
