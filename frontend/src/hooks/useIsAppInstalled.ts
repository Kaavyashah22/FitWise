import { useState, useEffect } from "react";

/**
 * Hook to detect whether the user has already installed the app
 * to their home screen / desktop, or is currently running in standalone PWA mode.
 *
 * Checks:
 * 1. iOS Safari standalone mode: (window.navigator as any).standalone
 * 2. Standard CSS display-mode: (display-mode: standalone) or (display-mode: fullscreen)
 * 3. Chrome/Android native 'appinstalled' event
 * 4. LocalStorage persistence if previously marked installed or dismissed
 */
export function useIsAppInstalled() {
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    // 1. Check iOS Safari standalone mode
    const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // 2. Check CSS display-mode: standalone or fullscreen
    const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isDisplayFullscreen = window.matchMedia("(display-mode: fullscreen)").matches;

    // 3. Check localStorage flag if previously installed or dismissed
    const isStoredInstalled = localStorage.getItem("fitwise_app_installed") === "true";
    const isDismissed = localStorage.getItem("fitwise_install_prompt_dismissed") === "true";

    return isIosStandalone || isDisplayStandalone || isDisplayFullscreen || isStoredInstalled || isDismissed;
  });

  const [isStandaloneRunning, setIsStandaloneRunning] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;
    return isIosStandalone || isDisplayStandalone;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen for Chromium 'appinstalled' event
    const handleAppInstalled = () => {
      localStorage.setItem("fitwise_app_installed", "true");
      setIsInstalled(true);
    };

    // Listen for display-mode media query transitions
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        localStorage.setItem("fitwise_app_installed", "true");
        setIsInstalled(true);
        setIsStandaloneRunning(true);
      }
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      }
    };
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem("fitwise_install_prompt_dismissed", "true");
    setIsInstalled(true);
  };

  const markInstalled = () => {
    localStorage.setItem("fitwise_app_installed", "true");
    setIsInstalled(true);
  };

  return { isInstalled, isStandaloneRunning, dismissPrompt, markInstalled };
}
