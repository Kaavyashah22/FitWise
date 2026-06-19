import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Dumbbell, 
  BarChart3, 
  Bot, 
  LogOut, 
  Sun, 
  Moon,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/coach", label: "Coach", icon: Bot },
];

export default function AppNavigation() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  return (
    <>
      {/* DESKTOP TOP NAV (Floating Pill) */}
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl items-center justify-between px-6 py-3 rounded-full bg-zinc-950/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/20">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">FitWise</span>
        </div>

        {/* Center Links */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </NavLink>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full text-zinc-400 hover:text-white hover:bg-white/10">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full gap-2 pl-2 pr-4 bg-white/10 text-white hover:bg-white/20 border border-white/10">
                <div className="bg-primary/20 p-1 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-white/10">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-zinc-300 focus:bg-white/10 focus:text-white">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAV (Floating Pill) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] flex items-center justify-between px-2 py-2 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg mb-1 transition-all duration-300",
                isActive ? "bg-primary/20" : ""
              )}>
                <link.icon className={cn("h-5 w-5", isActive ? "scale-110" : "")} />
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
            </NavLink>
          );
        })}
        
        {/* Settings/Profile Drawer Trigger for Mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-transparent">
              <div className="p-1.5 rounded-lg mb-1">
                <User className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={20} className="w-56 glass-card border-white/10 mb-2">
            <DropdownMenuLabel className="truncate">{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={toggle} className="text-zinc-300 focus:bg-white/10 focus:text-white">
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </>
  );
}
