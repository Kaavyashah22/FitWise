import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
  User,
  Edit2,
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/coach", label: "Coach", icon: Bot },
];

export default function AppNavigation() {
  const { user, logout, updateName } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Scroll animations for Mobile Nav
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 100], [1, 0.90]);
  const y = useTransform(scrollY, [0, 100], [0, 12]);

  useEffect(() => {
    if (user?.name) setNewName(user.name);
  }, [user]);

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === user?.name) {
      setIsEditProfileOpen(false);
      return;
    }
    setIsSavingName(true);
    try {
      await updateName(newName.trim());
      setIsEditProfileOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <>
      {/* DESKTOP TOP NAV (Floating Pill) */}
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl items-center justify-between px-6 py-3 rounded-full bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="p-1.5 rounded-full bg-primary/20">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">FitWise</span>
        </Link>

        {/* Center Links */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-border/50">
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
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {link.label}
              </NavLink>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full gap-2 pl-2 pr-4 border border-border/50">
                <div className="bg-primary/20 p-1 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)} className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAV (Floating Pill) */}
      <motion.nav 
        style={{ scale, y, x: "-50%" }} // Framer motion replaces -translate-x-1/2 with x: "-50%" when both are applied via style/class
        className="md:hidden fixed bottom-4 left-1/2 z-50 w-[95%] flex items-center justify-between px-2 py-2 rounded-full bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl"
      >
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
                  : "text-muted-foreground hover:text-foreground"
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
            <Button variant="ghost" className="flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-xl text-muted-foreground hover:text-foreground hover:bg-transparent">
              <div className="p-1.5 rounded-lg mb-1">
                <User className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={20} className="w-56 glass-card mb-2">
            <DropdownMenuLabel className="truncate">{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)} className="cursor-pointer">
              <Edit2 className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggle}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.nav>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px] glass-card border-white/10 bg-background/95">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your display name. Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-foreground">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3 bg-background border-border text-foreground focus-visible:ring-primary"
                disabled={isSavingName}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName} disabled={isSavingName || !newName.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isSavingName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
