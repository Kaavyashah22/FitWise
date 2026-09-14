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
  Loader2,
  Sparkles,
  Smartphone
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
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/coach", label: "Coach", icon: Bot },
];

export default function AppNavigation() {
  const { user, logout, updateName } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
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
      {/* DESKTOP TOP NAV (Edge-to-Edge Sticky Header) */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 w-full items-center border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm transition-all duration-200">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/landing" className="flex items-center gap-2.5 transition-transform hover:scale-105" title="FitWise Home">
            <div className="p-1.5 rounded-xl bg-primary/20 text-primary">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight font-sans">FitWise</span>
          </Link>

          {/* Center Links (Clean Spaced Headings) */}
          <nav className="flex items-center h-full gap-2 lg:gap-6" aria-label="Main navigation">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "relative h-full flex items-center px-3.5 text-sm font-medium transition-colors duration-150 group",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="py-1 px-1 rounded-md group-hover:text-foreground transition-colors">
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="desktopNavActiveIndicator"
                      className="absolute bottom-0 inset-x-1 h-[2px] bg-primary rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.75)]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 h-9 w-9">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="rounded-full gap-2 pl-2 pr-3.5 h-9 border border-border/50 hover:bg-secondary/80 transition-colors">
                  <div className="h-6 w-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm truncate max-w-[110px] font-medium">{user?.name?.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)} className="cursor-pointer">
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsInstallOpen(true)} className="cursor-pointer">
                  <Smartphone className="mr-2 h-4 w-4 text-primary" />
                  <span>Install Mobile App</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/landing" className="flex items-center w-full">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    <span>Product Overview</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

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
              <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-1">
                <User className="w-3.5 h-3.5 text-primary" />
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
            <DropdownMenuItem onClick={() => setIsInstallOpen(true)} className="cursor-pointer">
              <Smartphone className="mr-2 h-4 w-4 text-primary" />
              <span>Install Mobile App</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/landing" className="flex items-center w-full">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <span>Product Overview</span>
              </Link>
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

      {/* INSTALL APP / PWA MODAL */}
      <Dialog open={isInstallOpen} onOpenChange={setIsInstallOpen}>
        <DialogContent className="sm:max-w-[420px] glass-card border-primary/20 bg-background/95">
          <DialogHeader className="text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-primary/30 flex items-center justify-center mb-2">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Install FitWise on iPhone</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Run FitWise in full-screen standalone mode without any browser bars — perfect for gym sessions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/60">
              <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">1</div>
              <div>
                <p className="font-semibold text-foreground text-xs">Open in Safari & Tap Share</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tap the Safari <strong>Share</strong> icon at the bottom of your screen (<span className="text-primary font-mono text-xs">⎋ / [↑]</span>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/60">
              <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">2</div>
              <div>
                <p className="font-semibold text-foreground text-xs">Tap &quot;Add to Home Screen&quot;</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Scroll down the share sheet and select <strong>&quot;Add to Home Screen&quot;</strong>, then tap <strong>Add</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/60">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">3</div>
              <div>
                <p className="font-semibold text-foreground text-xs">Launch from Home Screen</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tap the FitWise icon on your Home Screen for the full native gym app experience!
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsInstallOpen(false)} className="w-full bg-primary text-primary-foreground font-semibold">
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
