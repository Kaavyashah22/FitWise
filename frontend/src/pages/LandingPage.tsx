import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Dumbbell, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  LineChart, 
  Sun, 
  Moon, 
  Bot, 
  Check, 
  ExternalLink, 
  Code2, 
  Stethoscope, 
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Sliders,
  AlertCircle,
  HelpCircle,
  Compass,
  CheckCheck,
  GraduationCap,
  Award,
  Scale,
  BarChart3,
  Smartphone,
  WifiOff,
  QrCode,
  Download,
  Share2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { InstallAppModal } from "@/components/InstallAppModal";

import {
  ResponsiveContainer,
  LineChart as RcLineChart,
  Line as RcLine,
  BarChart as RcBarChart,
  Bar as RcBar,
  XAxis as RcXAxis,
  YAxis as RcYAxis,
  Tooltip as RcTooltip,
  CartesianGrid as RcCartesianGrid,
  Legend as RcLegend,
  ReferenceLine as RcReferenceLine,
  Cell as RcCell,
} from "recharts";

// Apple-Style Fluid Scroll Animation Variants
const appleTransition = {
  duration: 0.85,
  ease: [0.16, 1, 0.3, 1], // Apple fluid deceleration cubic-bezier
};

const appleFadeUp = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: appleTransition 
  },
};

const appleStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const appleChild = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appleTransition,
  },
};

// Interactive Simulator Types
type GoalType = "cut" | "bulk" | "recomp";
type ConditionType = "none" | "asthma" | "knee" | "hypertension";

interface PresetData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  splitTitle: string;
  guardrailNote: string | null;
  exercises: { name: string; sets: string; reps: string; note: string }[];
  coachAdvice: string;
}

const SIMULATOR_PRESETS: Record<GoalType, Record<ConditionType, PresetData>> = {
  cut: {
    none: {
      calories: 1850,
      protein: 175,
      carbs: 140,
      fats: 50,
      splitTitle: "High-Deficit Metabolic Resistance",
      guardrailNote: null,
      exercises: [
        { name: "Barbell Back Squat", sets: "4", reps: "8-10", note: "Primary compound driver, explosive concentric phase" },
        { name: "Romanian Deadlift", sets: "3", reps: "10-12", note: "Posterior chain hypertrophy, strict eccentric control" },
        { name: "Dumbbell Incline Bench", sets: "3", reps: "10-12", note: "Upper chest focus, constant mechanical tension" },
        { name: "HIIT Assault Bike Sprints", sets: "5", reps: "30s on / 60s off", note: "Max EPOC calorie burn protocol" },
      ],
      coachAdvice: "Caloric deficit dialed to -500 kcal. Protein maintained at 2.2g/kg to preserve lean tissue during rapid fat loss.",
    },
    asthma: {
      calories: 1850,
      protein: 175,
      carbs: 140,
      fats: 50,
      splitTitle: "Broncho-Safe Metabolic Protocol",
      guardrailNote: "Medical Guardrail Triggered: Replaced high-intensity sprint intervals with steady-state Zone 2 tempo to prevent exercise-induced bronchospasm.",
      exercises: [
        { name: "Leg Press (Neutral Footing)", sets: "4", reps: "10-12", note: "Controlled spinal loading, no erratic breathing surges" },
        { name: "Dumbbell Romanian Deadlift", sets: "3", reps: "10-12", note: "Rhythmic breathing pattern synchronized with reps" },
        { name: "Incline Chest Supported Row", sets: "3", reps: "12", note: "Unrestricted diaphragm expansion without spinal compression" },
        { name: "Zone 2 Low-Impact Incline Walk", sets: "1", reps: "25 min @ 125 BPM", note: "Aerobic base building under bronchospasm threshold" },
      ],
      coachAdvice: "Llama-3 detected your respiratory profile. All high-ventilation anaerobic redline cardio was eliminated in favor of Zone 2 pacing.",
    },
    knee: {
      calories: 1850,
      protein: 175,
      carbs: 140,
      fats: 50,
      splitTitle: "Patella-Friendly Quadriceps & Hamstring Split",
      guardrailNote: "Medical Guardrail Triggered: Deep knee flexion squats swapped for glute-dominant hip hinges and hamstring curls to reduce patellar shear stress.",
      exercises: [
        { name: "Box Squat (Parallel Depth)", sets: "4", reps: "10", note: "Vertical shin angle eliminates anterior knee shear" },
        { name: "Lying Leg Curl", sets: "4", reps: "12-15", note: "Direct hamstring hypertrophy with zero patellofemoral compression" },
        { name: "Bulgarian Split Squat (Rear Bias)", sets: "3", reps: "10/leg", note: "Glute-focused torso lean to protect knee capsule" },
        { name: "Low-Resistance Elliptical Conditioning", sets: "1", reps: "20 min", note: "Zero-impact joint lubrication and conditioning" },
      ],
      coachAdvice: "Patellofemoral joint safety activated. Exercises avoid knee extension angles >90° under heavy load while keeping training density high.",
    },
    hypertension: {
      calories: 1850,
      protein: 175,
      carbs: 140,
      fats: 50,
      splitTitle: "Vascular-Protected Cutting Protocol",
      guardrailNote: "Medical Guardrail Triggered: Valsalva maneuver warning active. Sub-maximal loads with continuous rhythmic breathing prescribed.",
      exercises: [
        { name: "Goblet Squat (Moderate Tempo)", sets: "3", reps: "12-15", note: "Exhale through exertion to avoid intra-thoracic pressure spikes" },
        { name: "Seated Cable Row", sets: "3", reps: "12-15", note: "Continuous rhythmic breathing, avoided heavy 1RM strains" },
        { name: "Dumbbell Flat Press", sets: "3", reps: "12-15", note: "Smooth cadence, strict 90-second monitored rest periods" },
        { name: "Stationary Recumbent Bike", sets: "1", reps: "20 min moderate", note: "Smooth heart-rate modulation without blood pressure spikes" },
      ],
      coachAdvice: "Llama-3 bypassed heavy strain lifting (sub-6RM) to avoid acute blood pressure spikes, prioritizing high-rep metabolic fatigue.",
    },
  },
  bulk: {
    none: {
      calories: 2850,
      protein: 190,
      carbs: 340,
      fats: 75,
      splitTitle: "Hypertrophy Volume Overload",
      guardrailNote: null,
      exercises: [
        { name: "Barbell Heavy Back Squat", sets: "5", reps: "5-8", note: "Progressive mechanical tension overload" },
        { name: "Barbell Bench Press", sets: "4", reps: "6-8", note: "Compound horizontal push foundation" },
        { name: "Barbell Bent Over Row", sets: "4", reps: "8-10", note: "Latissimus and rhomboid structural thickness" },
        { name: "Standing Overhead Press", sets: "3", reps: "8-10", note: "Deltoid and anterior chain drive" },
      ],
      coachAdvice: "Caloric surplus pegged at +350 kcal for lean tissue accrual with minimal adipose storage. Progressive overload prioritized.",
    },
    asthma: {
      calories: 2850,
      protein: 190,
      carbs: 340,
      fats: 75,
      splitTitle: "Extended-Recovery Hypertrophy Blueprint",
      guardrailNote: "Medical Guardrail Triggered: Extended rest intervals (120s+) enforced between heavy sets to normalize pulmonary ventilation.",
      exercises: [
        { name: "Hack Squat Machine", sets: "4", reps: "8-10", note: "Guided path isolates quads with controlled, steady respiration" },
        { name: "Incline Dumbbell Press", sets: "4", reps: "8-10", note: "Unrestricted ribcage expansion, 2-minute recovery between sets" },
        { name: "Chest-Supported T-Bar Row", sets: "4", reps: "10-12", note: "Torso stabilized to maximize oxygen efficiency" },
        { name: "Cable Lateral Raises", sets: "3", reps: "12-15", note: "Targeted shoulder hypertrophy without cardiovascular fatigue" },
      ],
      coachAdvice: "Extended 120s-150s rest timers applied automatically. Heavy hypertrophy achieved while keeping respiratory rates strictly regulated.",
    },
    knee: {
      calories: 2850,
      protein: 190,
      carbs: 340,
      fats: 75,
      splitTitle: "Posterior-Dominant Hypertrophy Split",
      guardrailNote: "Medical Guardrail Triggered: Replaced deep front squats with hip thrusts and Romanian deadlifts to build leg mass safely.",
      exercises: [
        { name: "Barbell Hip Thrust", sets: "4", reps: "8-10", note: "Peak glute contraction with near-zero patellofemoral shear" },
        { name: "Seated Leg Curl", sets: "4", reps: "10-12", note: "Hamstring overload in lengthened position without joint strain" },
        { name: "Incline Dumbbell Press", sets: "4", reps: "6-8", note: "Upper body strength development unaffected by lower body flags" },
        { name: "Standing Calf Raises", sets: "4", reps: "12-15", note: "Ankle stability strengthening with locked knee angle" },
      ],
      coachAdvice: "Heavy lower body hypertrophy shifted toward the posterior chain. Knee flexion moments minimized while maintaining high leg stimulus.",
    },
    hypertension: {
      calories: 2850,
      protein: 190,
      carbs: 340,
      fats: 75,
      splitTitle: "Cadence-Controlled Mass Builder",
      guardrailNote: "Medical Guardrail Triggered: Inverted rows and machine presses selected to keep head elevated and maintain steady arterial flow.",
      exercises: [
        { name: "Seated Chest Press Machine", sets: "4", reps: "10-12", note: "Controlled eccentric, zero head drop beneath heart level" },
        { name: "Leg Press (High & Wide Stance)", sets: "4", reps: "12", note: "Prevents abdominal compression; constant steady exhalation" },
        { name: "Lat Pulldown (Neutral Grip)", sets: "4", reps: "10-12", note: "Upper back mass with controlled cardiac load" },
        { name: "Seated Dumbbell Bicep Curl", sets: "3", reps: "12", note: "Isolated arm hypertrophy with monitored rest" },
      ],
      coachAdvice: "Eliminated head-down exercises (e.g., decline presses) and sub-5 rep max strain lifts to protect against blood pressure spikes.",
    },
  },
  recomp: {
    none: {
      calories: 2350,
      protein: 195,
      carbs: 230,
      fats: 60,
      splitTitle: "Hybrid Density Recomposition",
      guardrailNote: null,
      exercises: [
        { name: "Trap Bar Deadlift", sets: "4", reps: "6-8", note: "Full-body neural recruitment and hormonal stimulus" },
        { name: "Overhead Dumbbell Press", sets: "3", reps: "8-10", note: "Shoulder stability and vertical pushing power" },
        { name: "Weighted Pull-Up / Lat Pulldown", sets: "4", reps: "8-10", note: "Upper body vertical pull strength" },
        { name: "Kettlebell Swing Finisher", sets: "3", reps: "15", note: "Posterior power and metabolic density" },
      ],
      coachAdvice: "Isocaloric target tuned to baseline maintenance. Nutrient timing concentrates carbohydrates around your workout window.",
    },
    asthma: {
      calories: 2350,
      protein: 195,
      carbs: 230,
      fats: 60,
      splitTitle: "Paced Recomposition Architecture",
      guardrailNote: "Medical Guardrail Triggered: High-power ballistic finishers replaced with paced density sets to prevent hyperventilation.",
      exercises: [
        { name: "Trap Bar Deadlift (Sub-Max)", sets: "4", reps: "6-8", note: "Neutral spine, strict nasal-to-mouth breathing protocol" },
        { name: "Seated Dumbbell Overhead Press", sets: "3", reps: "8-10", note: "Upright posture facilitates natural lung airway volume" },
        { name: "Cable Seated Row", sets: "4", reps: "10-12", note: "Smooth resistance curve, controlled cadence" },
        { name: "Farmer's Carry Walk", sets: "3", reps: "40 meters", note: "Core stability under isometric load with steady breathing" },
      ],
      coachAdvice: "Recomposition protocol focused on isometric core control and machine stability to keep airway resistance low.",
    },
    knee: {
      calories: 2350,
      protein: 195,
      carbs: 230,
      fats: 60,
      splitTitle: "Low-Impact Structural Recomposition",
      guardrailNote: "Medical Guardrail Triggered: Quad dominant lifts replaced with posterior chain power to build strength without knee pain.",
      exercises: [
        { name: "Trap Bar Deadlift (High Handles)", sets: "4", reps: "6-8", note: "High handle position unloads knee shear and loads hips" },
        { name: "Dumbbell Flat Bench Press", sets: "4", reps: "8-10", note: "Heavy upper body stimulus completely independent of knee" },
        { name: "Chest Supported Neutral Row", sets: "4", reps: "10-12", note: "Upper back density without lower extremity loading" },
        { name: "Sled Drag (Backward Walk)", sets: "3", reps: "30 meters", note: "Rehabilitative patellar tendon blood flow without impact" },
      ],
      coachAdvice: "Reverse sled drags integrated specifically to strengthen patellar tendons through gentle VMO recruitment while burning fat.",
    },
    hypertension: {
      calories: 2350,
      protein: 195,
      carbs: 230,
      fats: 60,
      splitTitle: "Cardiovascular-Safe Recomposition Split",
      guardrailNote: "Medical Guardrail Triggered: Heavy isometric holds filtered out to prevent sustained vascular resistance.",
      exercises: [
        { name: "Dumbbell Romanian Deadlift", sets: "3", reps: "12", note: "Dynamic movement prevents blood pressure peaking" },
        { name: "Neutral Grip Incline Dumbbell Press", sets: "3", reps: "12", note: "Joint-friendly shoulder path with rhythmic exhalation" },
        { name: "Cable Face Pulls", sets: "4", reps: "15", note: "Posture correction and scapular retractor conditioning" },
        { name: "Low-Intensity Rower Intervals", sets: "1", reps: "15 min @ steady pace", note: "Smooth vascular blood circulation without tension" },
      ],
      coachAdvice: "Exercises with prolonged isometric strain (like heavy planks) avoided. Dynamic continuous motion chosen to keep heart rate in Zone 2.",
    },
  },
};

// Section Definitions for Spacebar / Keyboard Navigation & Floating Indicator
const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "preview", label: "Product Tour" },
  { id: "simulator", label: "AI Simulator" },
  { id: "features", label: "Core Features" },
  { id: "mobile-app", label: "Mobile App" },
  { id: "ml-benchmarks", label: "ML Telemetry" },
  { id: "architecture", label: "Architecture" },
  { id: "comparison", label: "Benchmark" },
  { id: "cta", label: "Get Started" },
];

// Academic & Model Performance Benchmark Telemetry
const LEARNING_CURVE_DATA = [
  { n: 120, label: "N=120 (15% Sample)", trainAcc: 100.0, cvAcc: 82.2, gap: 17.8 },
  { n: 255, label: "N=255", trainAcc: 100.0, cvAcc: 88.5, gap: 11.5 },
  { n: 392, label: "N=392", trainAcc: 100.0, cvAcc: 90.3, gap: 9.7 },
  { n: 528, label: "N=528", trainAcc: 100.0, cvAcc: 91.5, gap: 8.5 },
  { n: 664, label: "N=664", trainAcc: 100.0, cvAcc: 91.8, gap: 8.2 },
  { n: 800, label: "N=800 (Full Cohort)", trainAcc: 100.0, cvAcc: 92.4, gap: 7.6 },
];

const CV_FOLDS_DATA = [
  { fold: "Fold 1", accuracy: 93.5, samples: 200 },
  { fold: "Fold 2", accuracy: 95.5, samples: 200 },
  { fold: "Fold 3", accuracy: 89.5, samples: 200 },
  { fold: "Fold 4", accuracy: 90.0, samples: 200 },
  { fold: "Fold 5", accuracy: 93.5, samples: 200 },
];

const FEATURE_IMPORTANCE_DATA = [
  { feature: "Workload Load", importance: 28.4, formula: "Hours × Intensity" },
  { feature: "Recovery Strain", importance: 22.1, formula: "Soreness / (Sleep + 0.1)" },
  { feature: "Energy Balance", importance: 16.8, formula: "Nutrition / (Workload + 1.0)" },
  { feature: "Sleep Hours", importance: 14.2, formula: "Raw Telemetry Rest" },
  { feature: "Fatigue Level", importance: 10.5, formula: "Borg CR10 Soreness" },
  { feature: "Training Intensity", importance: 5.2, formula: "Rate of Perceived Exertion" },
  { feature: "Recovery Index", importance: 2.8, formula: "Autonomic Recovery Score" },
];

const ABLATION_ROWS = [
  { metric: "Cohort Scope", single: "Single-Sport (Athletics)", multi: "Multi-Sport (8 Disciplines)" },
  { metric: "Total Sample Size (N)", single: "146 Athletes", multi: "1,000 Athletes" },
  { metric: "Training Samples (N_train)", single: "~109 Athletes", multi: "800 Athletes" },
  { metric: "Classification Accuracy", single: "67.57%", multi: "92.50%" },
  { metric: "Macro F1-Score", single: "64.65%", multi: "90.35%" },
  { metric: "High-Risk Class Precision", single: "1.00 (100%)", multi: "1.00 (100%)" },
  { metric: "Limiting Factor / Diagnosis", single: "Sample Starvation (<15 High-Risk cases)", multi: "Cross-Disciplinary Generalization on Invariants" },
];

const LANDING_NAV_LINKS = [
  { id: "preview", label: "Tour" },
  { id: "simulator", label: "Simulator" },
  { id: "features", label: "Features" },
  { id: "mobile-app", label: "Mobile App" },
  { id: "ml-benchmarks", label: "ML Telemetry" },
  { id: "architecture", label: "Architecture" },
  { id: "comparison", label: "Benchmark" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  // Active section state for floating jump pills and navbar indicator
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [activeMlTab, setActiveMlTab] = useState<"learning" | "cv" | "features" | "ablation">("learning");
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);

  const appUrl = typeof window !== "undefined" && window.location.origin 
    ? window.location.origin 
    : "https://fit-wise-seven.vercel.app";

  // Interactive Simulator State
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("cut");
  const [selectedCondition, setSelectedCondition] = useState<ConditionType>("none");

  // Product Tour Tab State
  const [activeTourTab, setActiveTourTab] = useState<"coach" | "analytics" | "workouts" | "medical">("coach");

  const currentPreset = SIMULATOR_PRESETS[selectedGoal][selectedCondition];

  // SPACEBAR & KEYBOARD NAVIGATION (Smooth Glide)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack if user is inside an input, textarea, or button
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.tagName === "BUTTON"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        const currentScrollY = window.scrollY;
        const sectionElements = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];

        if (e.shiftKey) {
          // Backward jump (Shift + Space)
          for (let i = sectionElements.length - 1; i >= 0; i--) {
            const el = sectionElements[i];
            const targetY = Math.max(0, el.offsetTop - 70);
            if (targetY < currentScrollY - 40) {
              window.scrollTo({ top: targetY, behavior: "smooth" });
              return;
            }
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          // Forward jump (Space)
          for (let i = 0; i < sectionElements.length; i++) {
            const el = sectionElements[i];
            const targetY = Math.max(0, el.offsetTop - 70);
            if (targetY > currentScrollY + 40) {
              window.scrollTo({ top: targetY, behavior: "smooth" });
              return;
            }
          }
        }
      }
    };

    // Scrollspy observer for updating active section on scroll
    let observer: IntersectionObserver | null = null;
    if (typeof window !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: "-15% 0px -60% 0px" }
      );

      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) observer?.observe(el);
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      observer?.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary relative overflow-x-hidden">
      
      {/* =========================================================================
          CINEMATIC ANIMATED BACKGROUND: UNDULATING ORBS + CYBER GRID + PARTICLES
          ========================================================================= */}
      {/* =========================================================================
          CINEMATIC BACKGROUND: HARDWARE-ACCELERATED AMBIENT GLOW ORBS + CYBER GRID
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Static Ambient Glow Orbs (GPU Memory Safe & Hardware-Accelerated) */}
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] bg-emerald-500/15 dark:bg-primary/15 rounded-full blur-[90px] opacity-80" />
        <div className="absolute top-[35%] -left-[10%] w-[500px] h-[500px] bg-teal-400/12 dark:bg-emerald-500/10 rounded-full blur-[90px] opacity-70" />
        <div className="absolute top-[65%] -right-[10%] w-[550px] h-[550px] bg-emerald-400/12 dark:bg-teal-500/10 rounded-full blur-[90px] opacity-65" />

        {/* Subtle Cyber Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98114_1px,transparent_1px),linear-gradient(to_bottom,#10b98114_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)] opacity-90" />
      </div>

      {/* =========================================================================
          FLOATING QUICK JUMP DOT NAVIGATOR (DESKTOP)
          ========================================================================= */}
      <aside className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 p-2.5 rounded-full bg-background/70 backdrop-blur-md border border-border/50 shadow-xl">
        {SECTIONS.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className="group relative flex items-center justify-center p-1"
              aria-label={`Scroll to ${s.label}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-primary scale-125 shadow-md shadow-primary"
                    : "bg-muted-foreground/40 group-hover:bg-muted-foreground group-hover:scale-110"
                }`}
              />
              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-card border border-border text-[11px] font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                {s.label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Mobile Native Safe Area Status Bar Blur Shield (protects scrolling past notch / status bar) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 safe-top-status-bar bg-background/80 backdrop-blur-xl pointer-events-none transition-all" />

      {/* =========================================================================
          1. FIXED TOP NAVIGATION BAR (EDGE-TO-EDGE WITH SLIDING ACTIVE INDICATOR)
          ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm transition-all duration-200 pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105 shrink-0" title="FitWise Home">
            <div className="p-1.5 rounded-xl bg-primary/20 text-primary">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight font-sans">FitWise</span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-2 py-0 border-primary/30 text-primary bg-primary/10">
              AI 2.0
            </Badge>
          </Link>

          {/* Center Links (Sliding active indicator line matching dashboard) */}
          <nav className="hidden md:flex items-center h-full gap-1 lg:gap-2.5 xl:gap-5" aria-label="Landing page navigation">
            {LANDING_NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={cn(
                    "relative h-full flex items-center px-2 lg:px-3 text-xs xl:text-sm font-medium transition-colors duration-150 group whitespace-nowrap shrink-0",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="py-1 px-0.5 rounded-md group-hover:text-foreground transition-colors">
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="landingNavActiveIndicator"
                      className="absolute bottom-0 inset-x-1 h-[2px] bg-primary rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.75)]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggle} 
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 h-9 w-9 shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 sm:px-5 h-9 text-xs sm:text-sm shadow-lg shadow-primary/25 shrink-0 whitespace-nowrap"
              >
                <span><span className="hidden sm:inline">Go to </span>Dashboard</span>
                <ChevronRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 sm:px-5 h-9 text-xs sm:text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 shrink-0 whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (APPLE-STYLE FLUID REVEAL)
          ========================================================================= */}
      <section id="hero" className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-center items-center pt-[calc(env(safe-area-inset-top,0px)+5.5rem)] sm:pt-28 pb-8 sm:pb-12 px-4 max-w-5xl mx-auto text-center relative scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center my-auto"
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3 sm:mb-4 shadow-sm shadow-primary/10 backdrop-blur-md">
            <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
            <span>XGBoost Injury Radar • Fine-Tuned Llama 3 • Clinical Guardrails</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.12] font-sans">
            Transform Your Body With <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-primary to-teal-300 bg-clip-text text-transparent">
              Predictive AI Biomechanics
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed">
            Full-stack fitness intelligence system combining XGBoost predictive biomechanics, fine-tuned Meta Llama 3 (8B), and automated medical guardrails. Forecast injury risk, track 7-day volume load, and train with clinical precision.
          </p>

          {/* Mobile App & Offline Feature Badges */}
          <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => scrollToSection("mobile-app")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 hover:bg-secondary border border-border/60 hover:border-primary/40 text-foreground transition-all cursor-pointer hover:scale-105"
            >
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              <strong>iOS & Android App</strong>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("mobile-app")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 hover:bg-secondary border border-border/60 hover:border-emerald-500/40 transition-all cursor-pointer hover:scale-105"
            >
              <WifiOff className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Offline Gym Logging</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("mobile-app")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 hover:bg-secondary border border-border/60 hover:border-teal-500/40 transition-all cursor-pointer hover:scale-105"
            >
              <QrCode className="h-3.5 w-3.5 text-teal-400" />
              <span>Scan QR to Test</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
              className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-7 h-11 sm:h-12 text-sm sm:text-base shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform duration-200 shrink-0"
            >
              Build Your Custom Plan Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => scrollToSection("simulator")}
              className="w-full sm:w-auto rounded-full border-border/80 bg-background/50 hover:bg-foreground/5 h-11 sm:h-12 px-6 text-sm sm:text-base font-medium backdrop-blur-md shrink-0"
            >
              <Sliders className="mr-2 h-4 w-4 text-primary" />
              Test Drive AI Simulator
            </Button>
          </div>

          {/* Key Metrics Banner (Staggered Apple Reveal) */}
          <motion.div 
            variants={appleStagger}
            initial="hidden"
            animate="visible"
            className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full max-w-3xl"
          >
            <motion.div variants={appleChild} className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">92.5%</span>
              <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">XGBoost Accuracy</span>
            </motion.div>
            <motion.div variants={appleChild} className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-primary tracking-tight">100%</span>
              <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">High-Risk Precision</span>
            </motion.div>
            <motion.div variants={appleChild} className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">&lt; 2.8s</span>
              <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Modal GPU Streaming</span>
            </motion.div>
            <motion.div variants={appleChild} className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight">300+</span>
              <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Medical Protocols</span>
            </motion.div>
          </motion.div>

          {/* End of Hero Section Divider (Placed below the numbers where the section actually ends) */}
          <div className="w-full max-w-3xl border-b border-border/50 mt-8 sm:mt-10" />
        </motion.div>
      </section>

      {/* =========================================================================
          PRODUCT TOUR SECTION (APPLE-STYLE SCROLL REVEAL)
          ========================================================================= */}
      <section id="preview" className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-4 max-w-6xl mx-auto relative scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="text-center mb-8 sm:mb-10"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1">
            <Compass className="h-3 w-3 mr-1.5" /> Inside FitWise
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Explore the FitWise Ecosystem
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Take a sneak peek into the four core interfaces designed for precision, accountability, and clinical safety.
          </p>

          {/* Tour Tabs Bar */}
          <div className="mt-5 inline-grid grid-cols-2 sm:inline-flex sm:items-center p-1.5 rounded-2xl sm:rounded-full bg-secondary/50 border border-border/60 backdrop-blur-md gap-1 sm:gap-1.5 max-w-[95vw] sm:max-w-none">
            {[
              { id: "coach", label: "AI Coach Chat", icon: Bot },
              { id: "analytics", label: "Volume Analytics", icon: LineChart },
              { id: "workouts", label: "Workout Tracker", icon: Dumbbell },
              { id: "medical", label: "Medical Safety Layer", icon: ShieldCheck },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTourTab(t.id as "coach" | "analytics" | "workouts" | "medical")}
                className={`flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTourTab === t.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tour Display Card */}
        <motion.div 
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8 overflow-hidden relative"
        >
          <AnimatePresence mode="wait">
            {activeTourTab === "coach" && (
              <motion.div
                key="coach"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={appleTransition}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                    Live RAG Conversation
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    An AI Coach With Context of Every Injury & PR
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Unlike ChatGPT which starts from a blank slate every time, Coach Llama 3 retrieves your age, weight, past lift volumes, and medical restrictions from Supabase PostgreSQL before replying.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>Sub-3 second streaming token generation on Modal GPUs</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>Automatic progressive overload calculations based on past session logs</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-2xl bg-black/70 border border-border/80 p-5 space-y-3 font-sans text-xs shadow-inner">
                  {/* Mock Chat Message: User */}
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none max-w-[85%] text-xs leading-relaxed">
                      "I only have 35 minutes today and my lower back feels slightly strained from deadlifts yesterday. What should I do for push day?"
                    </div>
                  </div>
                  {/* Mock Chat Message: Coach */}
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 mt-1 shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-card border border-border/60 text-foreground p-3.5 rounded-2xl rounded-tl-none max-w-[90%] space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-[11px]">COACH LLAMA 3</span>
                        <span className="text-[10px] text-muted-foreground">• 1.9s RAG Response</span>
                        <Badge className="text-[9px] bg-amber-500/10 text-amber-300 border-amber-500/30 px-1.5 py-0">Spinal Unload Active</Badge>
                      </div>
                      <p className="leading-relaxed text-muted-foreground">
                        "Understood. Eliminating standing overhead barbell presses to avoid compressive axial spinal shear. We're pivoting to seated chest-supported dumbbell work and high-density cable extensions."
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTourTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={appleTransition}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 bg-cyan-400/5">
                    Progressive Overload Telemetry
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Progressive Overload & Volume Analytics
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Tracks cumulative weekly tonnage across muscle groups and monitors rate of progression, giving you predictive clarity on hypertrophy plateaus and recovery capacity.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>Weekly tonnage tracking across individual muscle groups</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>Automated progressive overload targets based on fatigue & volume drift</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-2xl bg-secondary/30 border border-border/80 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Tonnage Progress (Past 4 Weeks)</span>
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]">+14.2% Volume</Badge>
                  </div>
                  {/* Visual Bar Mock */}
                  <div className="grid grid-cols-4 gap-3 items-end h-32 pt-4 px-2">
                    {[
                      { week: "W1", height: "45%", val: "12,400 kg" },
                      { week: "W2", height: "60%", val: "14,100 kg" },
                      { week: "W3", height: "75%", val: "15,800 kg" },
                      { week: "W4", height: "92%", val: "17,250 kg" },
                    ].map((b, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-mono text-muted-foreground">{b.val}</span>
                        <div 
                          style={{ height: b.height }} 
                          className="w-full rounded-t-lg bg-gradient-to-t from-teal-500/50 to-primary transition-all duration-500" 
                        />
                        <span className="text-xs font-semibold text-foreground">{b.week}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTourTab === "workouts" && (
              <motion.div
                key="workouts"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={appleTransition}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/5">
                    Session Execution
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Zero-Friction Exercise Logging
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Designed for fast in-gym logging between sets. Track load, reps, RPE, and rest timers with minimal screen time. Automatically saves directly to Supabase.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>One-click previous session load repetition</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Integrated rest timer with audio-visual completion alerts</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-2xl bg-secondary/30 border border-border/80 p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">Barbell Incline Press</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">Target: 3 x 8-10</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { set: 1, prev: "80 kg x 10", current: "82.5 kg x 10", done: true },
                      { set: 2, prev: "80 kg x 9", current: "82.5 kg x 9", done: true },
                      { set: 3, prev: "80 kg x 8", current: "82.5 kg x 8", done: false },
                    ].map((s) => (
                      <div key={s.set} className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40 text-xs">
                        <span className="font-bold text-muted-foreground">Set {s.set}</span>
                        <span className="text-muted-foreground">Last: {s.prev}</span>
                        <span className="font-semibold text-foreground font-mono">{s.current}</span>
                        <Badge variant={s.done ? "default" : "outline"} className={s.done ? "bg-primary text-primary-foreground text-[10px]" : "text-[10px]"}>
                          {s.done ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTourTab === "medical" && (
              <motion.div
                key="medical"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={appleTransition}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="outline" className="text-rose-400 border-rose-400/30 bg-rose-400/5">
                    Proactive Clinical Guardrails
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Strict Medical Safeguards Embedded in Every Prompt
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Most fitness apps ignore your hypertension, knee arthritis, or asthma. FitWise was fine-tuned on clinical fitness consultations to actively veto dangerous biomechanics before they ever reach your workout card.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>Automatic screening for contraindicated intra-thoracic pressure (Valsalva)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCheck className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>Joint angle shear reduction for past meniscus, ACL, or shoulder impingements</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-2xl bg-secondary/30 border border-border/80 p-5 space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Live Safety Guardrail Interceptor</div>
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Hypertension Protocol Active</strong>
                      Bypassing high-effort isometric holds and inverted movements to prevent arterial pressure spikes.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Right Patellar Tendinopathy Override</strong>
                      Replaced 90° leg extensions with reverse sled pulls to promote vascular tendon remodeling.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* =========================================================================
          3. INTERACTIVE SIMULATOR (APPLE-STYLE SCROLL REVEAL)
          ========================================================================= */}
      <section id="simulator" className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-4 max-w-6xl mx-auto relative border-t border-border/40 scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="text-center mb-8 sm:mb-10"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1.5" /> Interactive Sandbox
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Test Drive the FitWise AI Engine
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Toggle your target goal and medical conditions below. Watch how our fine-tuned Llama 3 model alters calories, exercises, and safety guardrails in real time.
          </p>
        </motion.div>

        {/* Simulator Card Container */}
        <motion.div 
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden"
        >
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-border/60">
            {/* Goal Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-400" />
                1. Select Strategic Goal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "cut", label: "Cut", desc: "Fat Loss" },
                    { id: "bulk", label: "Bulk", desc: "Hypertrophy" },
                    { id: "recomp", label: "Recomp", desc: "Lean Muscle" },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`py-2.5 px-3 rounded-xl text-left border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                      selectedGoal === g.id
                        ? "bg-primary/15 border-primary text-foreground shadow-md shadow-primary/10 font-semibold"
                        : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <div className="text-sm font-medium">{g.label}</div>
                    <div className="text-[11px] opacity-75">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition / Medical Flag Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                2. Select Medical / Safety Constraint
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: "none", label: "None", sub: "Clear" },
                    { id: "asthma", label: "Asthma", sub: "Bronchial" },
                    { id: "knee", label: "Knee Issue", sub: "Joint Pain" },
                    { id: "hypertension", label: "High BP", sub: "Vascular" },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCondition(c.id)}
                    className={`py-2.5 px-2 rounded-xl text-center border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                      selectedCondition === c.id
                        ? "bg-primary/15 border-primary text-foreground shadow-md shadow-primary/10 font-semibold"
                        : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <div className="text-xs font-medium truncate">{c.label}</div>
                    <div className="text-[10px] opacity-70">{c.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic AI Generation Preview Area */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Generated Plan Breakdown */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Plan Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-primary font-semibold tracking-wide uppercase">AI Prescription Generated</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{currentPreset.splitTitle}</h3>
                </div>

                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 flex items-center gap-1.5 py-1 px-3">
                  <Cpu className="h-3.5 w-3.5 animate-spin" />
                  <span>Llama-3 (GGUF 4-bit)</span>
                </Badge>
              </div>

              {/* Guardrail Alert if Active */}
              <AnimatePresence mode="wait">
                {currentPreset.guardrailNote ? (
                  <motion.div
                    key={currentPreset.guardrailNote}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>{currentPreset.guardrailNote}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-guardrail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Clinical safety checks passed: Standard compound progression authorized.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Exercise Protocol Table */}
              <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden divide-y divide-border/40">
                {currentPreset.exercises.map((ex, i) => (
                  <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-foreground/[0.02] transition-colors">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                        {ex.name}
                      </div>
                      <div className="text-xs text-muted-foreground pl-6">{ex.note}</div>
                    </div>
                    <div className="flex items-center gap-2 pl-6 sm:pl-0 shrink-0">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {ex.sets} sets
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {ex.reps}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Macro & Coach Voice Card */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Macro Nutrients Widget */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/60">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dynamic Biometrics</span>
                  <span className="text-lg font-bold text-primary">{currentPreset.calories.toLocaleString()} kcal</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-background/60 border border-border/40 text-center">
                    <div className="text-xs text-muted-foreground">Protein</div>
                    <div className="text-base font-bold text-foreground mt-0.5">{currentPreset.protein}g</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 border border-border/40 text-center">
                    <div className="text-xs text-muted-foreground">Carbs</div>
                    <div className="text-base font-bold text-foreground mt-0.5">{currentPreset.carbs}g</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 border border-border/40 text-center">
                    <div className="text-xs text-muted-foreground">Fats</div>
                    <div className="text-base font-bold text-foreground mt-0.5">{currentPreset.fats}g</div>
                  </div>
                </div>
              </div>

              {/* Coach Persona Voice */}
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 relative">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Bot className="h-4 w-4" />
                  Coach Llama 3 Reasoning
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                  "{currentPreset.coachAdvice}"
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-primary/10">
                  <span>Latency: 2.1s</span>
                  <span>Safety Check: 100% Passed</span>
                </div>
              </div>

              {/* Unlock Profile CTA */}
              <Button 
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 shadow-lg shadow-primary/20"
              >
                Save This Plan To Your Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          4. BENTO GRID FEATURES SECTION (APPLE-STYLE STAGGERED REVEAL)
          ========================================================================= */}
      <section id="features" className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-4 max-w-6xl mx-auto relative border-t border-border/40 scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="text-center mb-10 sm:mb-12"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1">
            <Layers className="h-3 w-3 mr-1.5" /> Core Architecture
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-sans">
            Built Like an Elite Sports Science Lab
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
            FitWise combines five foundational AI engineering pillars to deliver personalized coaching without hallucinations or hazardous recommendations.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div 
          variants={appleStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          
          {/* Card 1: Fine-Tuned Llama 3 (Spans 2 columns on desktop) */}
          <motion.div 
            variants={appleChild}
            className="md:col-span-2 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Cpu className="h-32 w-32 text-primary" />
            </div>
            <div className="p-2.5 w-fit rounded-2xl bg-primary/15 text-primary border border-primary/20 mb-5">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Foundation Model</span>
            <h3 className="text-2xl font-bold text-foreground mt-1 mb-3">Fine-Tuned Meta Llama 3 (8B)</h3>
            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed mb-6">
              Explicitly fine-tuned on 300+ procedurally synthesized clinical fitness consultations. Running 4-bit Quantization (GGUF) via <code className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded text-primary">llama-cpp-python</code> on serverless NVIDIA GPUs on Modal.
            </p>
            
            {/* Terminal snippet */}
            <div className="rounded-xl bg-black/80 border border-white/10 p-4 font-mono text-xs text-emerald-400 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-zinc-500 pb-1 border-b border-zinc-800">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[10px]">modal_inference.py --quantize=Q4_K_M</span>
              </div>
              <p>&gt; Loading Llama-3-8B-Instruct-GGUF ...</p>
              <p className="text-zinc-400">&gt; Memory footprint reduced: 15.2 GB ➔ 4.45 GB (70.7% drop)</p>
              <p className="text-emerald-300">&gt; NVIDIA GPU warm latency: 1.84s (streaming tokens)</p>
            </div>
          </motion.div>

          {/* Card 2: Live RAG Pipeline */}
          <motion.div 
            variants={appleChild}
            className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-300"
          >
            <div className="p-2.5 w-fit rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/20 mb-5">
              <Database className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Live Context Injection</span>
            <h3 className="text-2xl font-bold text-foreground mt-1 mb-3">PostgreSQL RAG Pipeline</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every message dynamically retrieves your latest body metrics, injury logs, dietary limits (e.g. Vegan), and past set volumes directly into the LLM prompt.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-foreground/80 bg-secondary/40 p-2 rounded-lg">
                <Check className="h-3.5 w-3.5 text-teal-400" />
                <span>Zero hallucinations of past PRs</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/80 bg-secondary/40 p-2 rounded-lg">
                <Check className="h-3.5 w-3.5 text-teal-400" />
                <span>Continuous Supabase synchronization</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Medical Safety Guardrails */}
          <motion.div 
            variants={appleChild}
            className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-300"
          >
            <div className="p-2.5 w-fit rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-5">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Clinical Safety</span>
            <h3 className="text-xl font-bold text-foreground mt-1 mb-3">Hardened Guardrail Layer</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Medical conditions like Hypertension, Asthma, or Joint Tears trigger hard overrides preventing dangerous movements like the Valsalva maneuver or deep patellar loading.
            </p>
          </motion.div>

          {/* Card 4: Predictive Biomechanics & Injury Radar */}
          <motion.div 
            variants={appleChild}
            className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-300"
          >
            <div className="p-2.5 w-fit rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20 mb-5">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Predictive Machine Learning</span>
            <h3 className="text-xl font-bold text-foreground mt-1 mb-3">XGBoost Injury Radar</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Trained on 1,000 multi-sport athlete datasets with <strong>92.5% accuracy</strong> and <strong>100% high-risk precision</strong>. Continuously forecasts acute strain by evaluating trailing 7-day volume load (tonnage), sleep deficit, and Borg CR10 soreness before injuries occur.
            </p>
          </motion.div>

          {/* Card 5: Interactive Analytics */}
          <motion.div 
            variants={appleChild}
            className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-300"
          >
            <div className="p-2.5 w-fit rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 mb-5">
              <LineChart className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Telemetry & Progress</span>
            <h3 className="text-xl font-bold text-foreground mt-1 mb-3">Volume <span className="font-sans font-semibold">&</span> Macro Telemetry</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Track multi-week tonnage, micro-consistency streaks, and biometric trendlines through interactive Chart.js & Recharts dashboards.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* =========================================================================
          4.3. STANDALONE MOBILE APP (iOS & ANDROID) & LIVE QR SCANNER
          ========================================================================= */}
      <section id="mobile-app" className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-4 max-w-6xl mx-auto relative border-t border-border/40 scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="bg-primary/10 text-primary border-primary/30 mb-3 px-3 py-1 text-xs">
            <Smartphone className="h-3.5 w-3.5 mr-1.5 inline" /> Standalone Mobile Engine
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            FitWise on <span className="text-primary">iOS & Android</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Engineered as an installable Progressive Web App (PWA) with zero App Store friction. Works 100% offline in gym basements, launches full-screen directly from your home screen, and delivers hardware haptic feedback.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3 Core App Features */}
          <motion.div 
            variants={appleFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-40px" }}
            className="lg:col-span-7 space-y-4"
          >
            {/* Feature 1: Offline Logging */}
            <div className="p-5 sm:p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/70 shadow-lg hover:border-primary/40 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 group-hover:scale-110 transition-transform">
                  <WifiOff className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">100% Offline Gym Logging</h3>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500 bg-emerald-500/10">
                      Zero Signal Ready
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    Gym basements, underground studios, and trail runs often have zero internet reception. FitWise uses an optimistic local queue: log sets, reps, and weights without waiting. As soon as connectivity returns, your data automatically syncs to the cloud.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: Standalone Full-Screen Experience */}
            <div className="p-5 sm:p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/70 shadow-lg hover:border-primary/40 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/15 text-primary border border-primary/30 shrink-0 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">Zero App Store Lag (iOS & Android)</h3>
                    <Badge variant="outline" className="text-[10px] border-primary/40 text-primary bg-primary/10">
                      Instant PWA
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    No 500MB download or App Store account required. Install in 1 tap directly from Safari (iOS) or Chrome (Android) to your home screen or app drawer. Launches full-screen with zero browser search bars.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3: Hardware Haptic Rest Alerts */}
            <div className="p-5 sm:p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/70 shadow-lg hover:border-primary/40 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">Hardware Haptic Rest Alerts</h3>
                    <Badge variant="outline" className="text-[10px] border-teal-500/40 text-teal-500 bg-teal-500/10">
                      Physical Vibration
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    Device vibration pulses trigger directly through your phone's haptic motor when rest intervals complete between sets, keeping workouts on pace without needing to look at your phone.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live QR Code & Mobile App Card */}
          <motion.div 
            variants={appleFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-40px" }}
            className="lg:col-span-5"
          >
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-card/80 via-card/50 to-background/80 backdrop-blur-2xl border border-primary/30 shadow-2xl shadow-black/10 dark:shadow-primary/5 text-center flex flex-col items-center">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <QrCode className="h-3.5 w-3.5" />
                <span>Live Application</span>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-1">
                Scan to Open on Your Phone
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mb-5">
                Point your iPhone Camera or Android Google Lens at the code below to launch the live app directly on your phone.
              </p>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-200 transition-transform hover:scale-105 duration-300">
                <QRCodeSVG
                  value={appUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/icon-192.png",
                    x: undefined,
                    y: undefined,
                    height: 42,
                    width: 42,
                    excavate: true,
                  }}
                />
              </div>

              {/* Supported OS Badges */}
              <div className="flex items-center justify-center gap-3 mt-5">
                <Badge variant="secondary" className="text-xs py-1 px-3 gap-1.5 font-medium border border-border/60">
                  <span>Apple iOS (Safari)</span>
                </Badge>
                <Badge variant="secondary" className="text-xs py-1 px-3 gap-1.5 font-medium border border-border/60">
                  <span>Google Android (Chrome)</span>
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <Button
                  onClick={() => setIsInstallOpen(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 shadow-lg shadow-primary/20 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Install Guide</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(appUrl);
                    alert("FitWise URL copied to clipboard!");
                  }}
                  className="w-full border-border/80 hover:bg-secondary/60 text-foreground font-semibold text-xs h-10 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Copy Link</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          4.5. EMPIRICAL MACHINE LEARNING VALIDATION & MODEL BENCHMARK
          ========================================================================= */}
      <section id="ml-benchmarks" className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-4 max-w-6xl mx-auto relative border-t border-border/40 scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="text-center mb-8 sm:mb-10"
        >
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-3 px-3 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 inline" /> Empirical Model Telemetry
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Model Performance <span className="font-sans font-semibold">&</span> Cross-Validation
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Live verifiable telemetry from our scikit-learn & XGBoost pipeline. Interactive diagnostic learning curves, 5-fold cross-validation stability, and explainable feature importances.
          </p>

          {/* Interactive Mode Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: "learning", label: "Learning Curve (Convergence)", icon: TrendingUp },
              { id: "cv", label: "5-Fold Cross-Validation", icon: Award },
              { id: "features", label: "Feature Importance (XAI)", icon: BarChart3 },
              { id: "ablation", label: "Cohort Scaling Analysis", icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMlTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMlTab(tab.id as "learning" | "cv" | "features" | "ablation")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "bg-card/70 hover:bg-card border-border/60 text-muted-foreground hover:text-foreground backdrop-blur-md"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Interactive Tab Content */}
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Main Visual Card (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-4 border-b border-border/40 gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {activeMlTab === "learning" && "Diagnostic 1 • Empirical Convergence"}
                  {activeMlTab === "cv" && "Diagnostic 2 • Out-of-Fold Evaluation"}
                  {activeMlTab === "features" && "Diagnostic 3 • Explainable AI (XAI)"}
                  {activeMlTab === "ablation" && "Diagnostic 4 • Cohort Scaling"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                  {activeMlTab === "learning" && "Model Learning Curve: Generalization vs Sample Size"}
                  {activeMlTab === "cv" && "5-Fold Stratified Cross-Validation (Mean: 92.40%)"}
                  {activeMlTab === "features" && "Biomechanical Feature Importances (Weight Distribution)"}
                  {activeMlTab === "ablation" && "Single-Sport POC vs. Generalized Multi-Sport Model"}
                </h3>
              </div>
              <Badge variant="outline" className="w-fit text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                {activeMlTab === "learning" && "1,000 Athlete Telemetry"}
                {activeMlTab === "cv" && "k = 5 Stratified Folds"}
                {activeMlTab === "features" && "Random Forest & XGBoost Gain"}
                {activeMlTab === "ablation" && "67.57% → 92.50% Jump"}
              </Badge>
            </div>

            {/* TAB 1: LEARNING CURVE */}
            {activeMlTab === "learning" && (
              <div className="space-y-4">
                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={280} debounce={50}>
                    <RcLineChart data={LEARNING_CURVE_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                      <RcCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <RcXAxis dataKey="label" stroke="#888" fontSize={11} tickLine={false} />
                      <RcYAxis domain={[75, 102]} stroke="#888" fontSize={11} tickLine={false} unit="%" />
                      <RcTooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc", fontSize: "12px" }}
                        labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                        formatter={(val: number | string) => [`${Number(val).toFixed(1)}%`, ""]}
                      />
                      <RcLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
                      <RcLine type="monotone" dataKey="trainAcc" name="Training Accuracy" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444" }} />
                      <RcLine type="monotone" dataKey="cvAcc" name="5-Fold Cross-Validation Accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981" }} />
                    </RcLineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border/40 text-xs">
                  <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                    <span className="text-muted-foreground block">Subsampled Baseline (N=120)</span>
                    <span className="text-base font-bold text-amber-400 mt-0.5 block">82.2% CV (Gap: 17.8%)</span>
                    <span className="text-[11px] text-muted-foreground">Outperforms 67.57% single-sport POC</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                    <span className="text-muted-foreground block">Full Multi-Sport (N=800)</span>
                    <span className="text-base font-bold text-emerald-400 mt-0.5 block">92.4% CV (Gap: 7.6%)</span>
                    <span className="text-[11px] text-muted-foreground">Variance shrinks by 57%</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-background/50 border border-border/50">
                    <span className="text-muted-foreground block">Statistical Verdict</span>
                    <span className="text-base font-bold text-foreground mt-0.5 block">Generalization</span>
                    <span className="text-[11px] text-muted-foreground">Upward sloping validation curve</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 5-FOLD CROSS VALIDATION */}
            {activeMlTab === "cv" && (
              <div className="space-y-4">
                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={280} debounce={50}>
                    <RcBarChart data={CV_FOLDS_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                      <RcCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <RcXAxis dataKey="fold" stroke="#888" fontSize={12} tickLine={false} />
                      <RcYAxis domain={[80, 100]} stroke="#888" fontSize={11} tickLine={false} unit="%" />
                      <RcTooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc", fontSize: "12px" }}
                        labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                        itemStyle={{ color: "#10b981", fontWeight: 500 }}
                        formatter={(val: number | string) => [`${Number(val).toFixed(1)}% Validation Accuracy`, "Score"]}
                      />
                      <RcReferenceLine y={92.4} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: "Mean CV: 92.40%", fill: "#ef4444", fontSize: 11, position: "top" }} />
                      <RcBar dataKey="accuracy" name="Validation Accuracy (%)" radius={[8, 8, 0, 0]}>
                        {CV_FOLDS_DATA.map((entry, index) => (
                          <RcCell key={`cell-${index}`} fill={entry.accuracy >= 92 ? "#10b981" : "#0284c7"} />
                        ))}
                      </RcBar>
                    </RcBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    Stratified Sampling Standard Deviation: <strong>±2.29%</strong> across 5 completely non-overlapping validation splits.
                  </span>
                  <Badge className="bg-primary text-primary-foreground text-[10px]">Zero Test Leakage</Badge>
                </div>
              </div>
            )}

            {/* TAB 3: FEATURE IMPORTANCES */}
            {activeMlTab === "features" && (
              <div className="space-y-4">
                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={280} debounce={50}>
                    <RcBarChart data={FEATURE_IMPORTANCE_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <RcCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                      <RcXAxis type="number" stroke="#888" fontSize={11} unit="%" />
                      <RcYAxis dataKey="feature" type="category" stroke="#888" fontSize={11} tickLine={false} width={130} />
                      <RcTooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc", fontSize: "12px" }}
                        labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                        itemStyle={{ color: "#10b981", fontWeight: 500 }}
                        formatter={(val: number | string, _name: string, item: { payload?: { formula?: string } }) => [`${val}% (Formula: ${item?.payload?.formula || ""})`, "Feature Weight"]}
                      />
                      <RcBar dataKey="importance" fill="#10b981" radius={[0, 8, 8, 0]}>
                        {FEATURE_IMPORTANCE_DATA.map((entry, index) => (
                          <RcCell key={`cell-${index}`} fill={index === 0 ? "#10b981" : index < 3 ? "#059669" : "#0284c7"} />
                        ))}
                      </RcBar>
                    </RcBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>Top 3 features account for <strong>67.3%</strong> of model decisions: Workload Volume (28.4%), Recovery Strain (22.1%), Energy Balance (16.8%).</span>
                  <Badge variant="outline" className="text-[10px] w-fit">Explainable AI (XAI)</Badge>
                </div>
              </div>
            )}

            {/* TAB 4: SINGLE VS MULTI-SPORT ABLATION TABLE */}
            {activeMlTab === "ablation" && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-secondary/60 border-b border-border/60 text-foreground font-semibold">
                        <th className="p-3">Evaluation Dimension</th>
                        <th className="p-3 text-amber-400">Single-Sport POC (Athletics)</th>
                        <th className="p-3 text-emerald-400">Multi-Sport GBDT (All 8 Sports)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {ABLATION_ROWS.map((r, i) => (
                        <tr key={i} className="hover:bg-foreground/[0.02] transition-colors">
                          <td className="p-3 font-medium text-foreground">{r.metric}</td>
                          <td className="p-3 text-muted-foreground">{r.single}</td>
                          <td className="p-3 text-foreground font-semibold">{r.multi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  <strong>Methodological Finding:</strong> Human muscle tissue breakdown and recovery fatigue are universal physiological invariants. Combining multi-sport telemetry expanded dataset density, eliminating sample starvation and lifting accuracy from 67.57% to 92.50%.
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Key Validation Findings & Highlights (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Cpu className="h-4 w-4" />
              <span>Key Model Findings</span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <div className="p-3 rounded-2xl bg-background/60 border border-border/60 space-y-1">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block text-emerald-400">Sample Scaling Dynamics</span>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Expanding from isolated single-sport cohorts (N=146) to multi-sport telemetry (N=1,000) resolved minority class sample starvation, enabling gradient boosted trees to map non-linear strain thresholds.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-background/60 border border-border/60 space-y-1">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block text-emerald-400">Generalization Convergence</span>
                <p className="text-[12px] text-muted-foreground mt-1">
                  The empirical learning curve shows cross-validation accuracy steadily advancing from 82.2% to 92.4%, while the generalization gap contracted from 17.8% to 7.6%, confirming robust model convergence.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-background/60 border border-border/60 space-y-1">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block text-emerald-400">Cross-Fold Stability</span>
                <p className="text-[12px] text-muted-foreground mt-1">
                  5-Fold Stratified Cross-Validation confirms a uniform <strong>92.40% (±2.29%)</strong> accuracy across distinct out-of-fold validation splits with zero data leakage.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-background/60 border border-border/60 space-y-1">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block text-emerald-400">Clinical Safety Standard</span>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Maintained <strong>100% precision</strong> on the acute high-risk tier to protect athletes by preventing false-negative injury predictions.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Scikit-Learn & XGBoost</span>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">1,000 Athletes Evaluated</Badge>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          5. ARCHITECTURE PIPELINE (APPLE-STYLE STAGGERED 5-STEP SEQUENCE)
          ========================================================================= */}
      <section id="architecture" className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-4 max-w-6xl mx-auto relative border-t border-border/40 scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="text-center mb-10 sm:mb-12"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1">
            <Code2 className="h-3 w-3 mr-1.5" /> Production Blueprint
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            End-to-End Serverless AI Pipeline
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Engineered for high performance, zero idle cost, and sub-3-second responses across web and mobile.
          </p>
        </motion.div>

        {/* Pipeline Cards Grid */}
        <motion.div 
          variants={appleStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 relative"
        >
          {[
            {
              step: "01",
              title: "Client Edge",
              subtitle: "React + Tailwind",
              desc: "Edge-to-edge responsive UI, Framer Motion transitions, and JWT auth flow.",
              icon: Zap,
            },
            {
              step: "02",
              title: "FastAPI Gateway",
              subtitle: "Python Backend",
              desc: "Asynchronous REST endpoints, session verification, and Pydantic schema validation.",
              icon: Code2,
            },
            {
              step: "03",
              title: "RAG Retrieval",
              subtitle: "PostgreSQL Data",
              desc: "Fetches user medical restrictions, workout history, and biometrics into context.",
              icon: Database,
            },
            {
              step: "04",
              title: "Modal GPU",
              subtitle: "Llama 3 8B (4-bit)",
              desc: "Serverless inference on NVIDIA T4/A10G scaling to zero with <3s response times.",
              icon: Cpu,
            },
            {
              step: "05",
              title: "Safety Filter",
              subtitle: "Clinical Output",
              desc: "Guarantees medically safe workout prescriptions before delivery to client.",
              icon: ShieldCheck,
            },
          ].map((s, idx) => (
            <motion.div 
              key={idx} 
              variants={appleChild}
              className="p-5 rounded-2xl bg-card/60 border border-border/80 flex flex-col justify-between hover:border-primary/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-primary">{s.step}</span>
                  <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-base font-bold text-foreground">{s.title}</h4>
                <div className="text-xs text-primary font-medium mb-2">{s.subtitle}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* =========================================================================
          6. COMPARISON MATRIX (APPLE-STYLE SCROLL REVEAL)
          ========================================================================= */}
      <section id="comparison" className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-4 max-w-5xl mx-auto relative border-t border-border/40 scroll-mt-0">
        <motion.div
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="text-center mb-10 sm:mb-12"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1">
            <Activity className="h-3 w-3 mr-1.5" /> Direct Benchmark
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            FitWise vs. Generic Fitness Apps
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            See how specialized generative AI with RAG outperforms static fitness apps and unconstrained generic chat tools.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div 
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-xl"
        >
          <div className="grid grid-cols-12 p-4 sm:p-5 bg-secondary/50 border-b border-border/60 text-xs sm:text-sm font-semibold text-foreground">
            <div className="col-span-5 sm:col-span-4">Capability</div>
            <div className="col-span-3 sm:col-span-4 text-muted-foreground">Generic Gym Apps</div>
            <div className="col-span-4 sm:col-span-4 text-primary font-bold">FitWise AI System</div>
          </div>

          <div className="divide-y divide-border/40 text-xs sm:text-sm">
            {[
              {
                feature: "Workout Personalization",
                traditional: "Fixed static PDF templates",
                fitwise: "100% dynamic Llama 3 generation",
              },
              {
                feature: "Medical Safety & Injuries",
                traditional: "Completely ignored / manual caution",
                fitwise: "Automated clinical guardrails (Asthma, BP, Joints)",
              },
              {
                feature: "Biometric Data Retrieval",
                traditional: "Manual log re-entry every session",
                fitwise: "Live PostgreSQL RAG context injection",
              },
              {
                feature: "Inference & AI Speed",
                traditional: "N/A or slow public ChatGPT APIs",
                fitwise: "Sub-3s fine-tuned model on serverless GPUs",
              },
              {
                feature: "Goal Classification",
                traditional: "Rule-based estimation",
                fitwise: "Trained KNN Archetype Classifier (k=3)",
              },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-foreground/[0.02] transition-colors">
                <div className="col-span-5 sm:col-span-4 font-medium text-foreground">{row.feature}</div>
                <div className="col-span-3 sm:col-span-4 text-muted-foreground text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="text-rose-400 hidden sm:inline">✕</span>
                  <span>{row.traditional}</span>
                </div>
                <div className="col-span-4 sm:col-span-4 text-primary font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary hidden sm:inline" />
                  <span>{row.fitwise}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          7. FINAL CALL TO ACTION BANNER (APPLE-STYLE SCROLL REVEAL)
          ========================================================================= */}
      <section id="cta" className="min-h-[85vh] flex flex-col justify-center pt-24 pb-24 px-4 max-w-5xl mx-auto relative border-t border-border/40 scroll-mt-0">
        <motion.div 
          variants={appleFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-40px" }}
          className="rounded-3xl bg-gradient-to-br from-emerald-950/60 via-card/80 to-background border border-primary/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl shadow-primary/10"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-3 py-1">
            <Zap className="h-3.5 w-3.5 mr-1" /> Start Your Fitness Evolution
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto">
            Ready to train with intelligent, safe, adaptive AI?
          </h2>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Create your profile in 60 seconds. Set your biometrics, add your health considerations, and let FitWise generate your first clinical protocol.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 text-base shadow-xl shadow-primary/30 hover:scale-105 transition-all"
            >
              Get Started Now — It's Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free forever tier
            </span>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          8. FOOTER
          ========================================================================= */}
      <footer className="border-t border-border/60 py-12 px-6 max-w-6xl mx-auto text-sm text-muted-foreground pb-20 sm:pb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground text-base">FitWise</span>
            <span className="text-xs text-muted-foreground">
              — AI Fitness Intelligence System
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-2.5 text-xs text-center px-1">
            <button onClick={() => scrollToSection("preview")} className="hover:text-foreground transition-colors">Tour</button>
            <button onClick={() => scrollToSection("simulator")} className="hover:text-foreground transition-colors">Simulator</button>
            <button onClick={() => scrollToSection("features")} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollToSection("ml-benchmarks")} className="hover:text-foreground transition-colors">ML Telemetry</button>
            <button onClick={() => scrollToSection("architecture")} className="hover:text-foreground transition-colors">Architecture</button>
            <button onClick={() => scrollToSection("comparison")} className="hover:text-foreground transition-colors">Benchmark</button>
            <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center sm:text-left">
          <p>
            Designed & Developed by <strong className="text-foreground">Kaavya Shah</strong> • Full-Stack & Generative AI Engineer
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/Kaavyashah22/FitWise" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Install App Modal (with Live QR Code & Android/iOS guides) */}
      <InstallAppModal open={isInstallOpen} onOpenChange={setIsInstallOpen} />

    </div>
  );
}
