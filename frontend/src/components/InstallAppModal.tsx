import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Download, 
  Smartphone, 
  WifiOff, 
  QrCode, 
  Check, 
  Copy, 
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface InstallAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDevice?: "android" | "ios";
}

export function InstallAppModal({
  open,
  onOpenChange,
  defaultDevice,
}: InstallAppModalProps) {
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installDevice, setInstallDevice] = useState<"android" | "ios">("android");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"install" | "qr">("install");

  // Determine current app URL for QR code & sharing
  const appUrl = typeof window !== "undefined" && window.location.origin 
    ? window.location.origin 
    : "https://fit-wise-seven.vercel.app";

  useEffect(() => {
    if (defaultDevice) {
      setInstallDevice(defaultDevice);
      return;
    }

    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setInstallDevice("ios");
      } else {
        setInstallDevice("android");
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [defaultDevice]);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        onOpenChange(false);
        toast({
          title: "Installing FitWise! 🚀",
          description: "Check your home screen or app drawer.",
        });
      }
      setDeferredPrompt(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    toast({
      title: "Link Copied! 📋",
      description: "App URL copied to clipboard. Share or open on your mobile phone.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] glass-card border-primary/20 bg-background/95 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-primary/30 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/10 text-primary">
                iOS & Android
              </Badge>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                <WifiOff className="h-3 w-3" /> Offline Ready
              </Badge>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold mt-2">
            Install FitWise Mobile App
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Standalone experience for iOS & Android — zero app store downloads, full-screen immersion, and 100% offline gym workout logging.
          </DialogDescription>
        </DialogHeader>

        {/* View Toggle: Install Guide vs Live QR Code */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-secondary/60 rounded-xl border border-border/60 text-xs font-semibold text-center">
          <button
            type="button"
            onClick={() => setActiveTab("install")}
            className={cn(
              "py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all",
              activeTab === "install"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Install Guide</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={cn(
              "py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all",
              activeTab === "qr"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {activeTab === "qr" ? (
          /* Live QR Code Card for Mobile App */
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/40 border border-border/70 text-center space-y-3">
            <div className="p-3.5 bg-white rounded-2xl shadow-xl shadow-black/10 dark:shadow-primary/5 border border-slate-200">
              <QRCodeSVG
                value={appUrl}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/icon-192.png",
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="space-y-1 max-w-xs">
              <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Scan with Phone Camera
              </p>
              <p className="text-[11px] text-muted-foreground">
                Point your iPhone Camera or Android Google Lens to open and test the mobile app instantly.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                className="w-full text-xs font-semibold gap-1.5 h-8 border border-border/60"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Link Copied!" : "Copy App Link"}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Install Guide */
          <div className="space-y-3">
            {/* Android 1-Tap Direct Install (when Chrome beforeinstallprompt is ready) */}
            {deferredPrompt && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 flex flex-col gap-2">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Chrome 1-Click Install Ready:
                </p>
                <Button 
                  onClick={handleNativeInstall} 
                  className="w-full bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Install App for Android
                </Button>
              </div>
            )}

            {/* Device Platform Selector */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-secondary/50 rounded-xl border border-border/50 text-xs font-semibold text-center">
              <button
                type="button"
                onClick={() => setInstallDevice("android")}
                className={cn(
                  "py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5",
                  installDevice === "android"
                    ? "bg-foreground/10 text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setInstallDevice("ios")}
                className={cn(
                  "py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5",
                  installDevice === "ios"
                    ? "bg-foreground/10 text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>iOS (iPhone)</span>
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2 text-sm">
              {installDevice === "android" ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">Open in Google Chrome</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Tap the three vertical dots menu icon (<strong className="text-foreground">⋮</strong>) in the top-right corner of Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">Tap &quot;Install app&quot;</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Select <strong>&quot;Install app&quot;</strong> (or <strong>&quot;Add to Home screen&quot;</strong>) from the menu list.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">Launch from Home Screen</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        FitWise launches in standalone mode with vibration haptics & 100% offline gym tracking.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">Open in Safari & Tap Share</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Tap the Safari <strong>Share</strong> icon at the bottom of your screen (<span className="text-primary font-mono text-xs">[↑]</span>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">Tap &quot;Add to Home Screen&quot;</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Scroll down the share sheet and select <strong>&quot;Add to Home Screen&quot;</strong>, then tap <strong>Add</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">Launch from Home Screen</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Tap the FitWise dumbbell icon on your Home Screen. Full-screen immersion and offline logging are active.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Feature summary callout */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500/90 dark:text-emerald-400 flex items-start gap-2">
          <WifiOff className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>Gym Baseline Ready:</strong> Once installed, you can log exercises completely offline without cellular reception. All sets automatically sync to the cloud when connection returns.
          </span>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab(activeTab === "install" ? "qr" : "install")} 
            className="flex-1 text-xs"
          >
            {activeTab === "install" ? "Show QR Code" : "Show Instructions"}
          </Button>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
