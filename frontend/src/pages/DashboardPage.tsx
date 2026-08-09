/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, saveProfile, UserProfile } from "@/lib/auth";
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, getCalorieTarget, validateGoal } from "@/lib/health";
import { FitnessPlan } from "@/lib/fitness-plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, Flame, Target, AlertTriangle, Utensils, Dumbbell, Loader2, Edit3, UserCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPlan, getProfileAPI, saveProfileAPI } from "@/lib/apiClient";
import { Pie } from "react-chartjs-2";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const existing = user ? getProfile(user.id) : null;

  const [age, setAge] = useState(existing?.age?.toString() || "");
  const [height, setHeight] = useState(existing?.height?.toString() || "");
  const [weight, setWeight] = useState(existing?.weight?.toString() || "");
  const [gender, setGender] = useState<"male" | "female">(existing?.gender || "male");
  const [activity, setActivity] = useState(existing?.activityLevel || "moderate");
  const [goal, setGoal] = useState(existing?.goal || "maintain");
  const [medicalHistory, setMedicalHistory] = useState(existing?.medical_history || "None");
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [foodType, setFoodType] = useState<"veg" | "nonveg" | "vegan">(existing?.food_preference || "nonveg");
  const planRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getProfileAPI().then((apiProfile) => {
        if (apiProfile && Object.keys(apiProfile).length > 0) {
          if (apiProfile.age) setAge(apiProfile.age.toString());
          if (apiProfile.height_cm) setHeight(apiProfile.height_cm.toString());
          if (apiProfile.weight_kg) setWeight(apiProfile.weight_kg.toString());
          if (apiProfile.gender) setGender(apiProfile.gender as "male" | "female");
          if (apiProfile.activity_level) setActivity(apiProfile.activity_level as any);
          if (apiProfile.goal) setGoal(apiProfile.goal as any);
          if (apiProfile.food_preference) setFoodType(apiProfile.food_preference as any);
          if (apiProfile.medical_history) setMedicalHistory(apiProfile.medical_history);
        }
      }).catch(err => {
        console.warn("Could not fetch profile from API, using local form state.", err);
      });
    }
  }, [user]);

  const profile: UserProfile | null = useMemo(() => {
    if (!user || !age || !height || !weight) return null;
    return {
      userId: user.id,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender,
      activityLevel: activity as UserProfile["activityLevel"],
      goal: goal as UserProfile["goal"],
      medical_history: medicalHistory,
    };
  }, [user, age, height, weight, gender, activity, goal, medicalHistory]);

  const bmi = profile ? calculateBMI(profile.weight, profile.height) : null;
  const bmiCat = bmi ? getBMICategory(bmi) : null;
  const bmr = profile ? calculateBMR(profile) : null;
  const tdee = profile ? calculateTDEE(profile) : null;
  const calorieTarget = tdee && profile ? getCalorieTarget(tdee, profile.goal) : null;
  const macros = useMemo(() => {
    if (!profile || !calorieTarget) return null;
  
    const weight = profile.weight;
    let proteinGrams = 0;
    let fatGrams = 0;
  
    if (profile.goal === "cut") {
      proteinGrams = 2.2 * weight;
      fatGrams = (0.25 * calorieTarget) / 9;
    } 
    else if (profile.goal === "bulk") {
      proteinGrams = 1.8 * weight;
      fatGrams = (0.25 * calorieTarget) / 9;
    } 
    else {
      proteinGrams = 2 * weight;
      fatGrams = (0.30 * calorieTarget) / 9;
    }
  
    const proteinCalories = proteinGrams * 4;
    const fatCalories = fatGrams * 9;
    const remainingCalories = calorieTarget - (proteinCalories + fatCalories);
    const carbGrams = remainingCalories / 4;
    const carbCalories = carbGrams * 4;
  
    const totalCalories = proteinCalories + carbCalories + fatCalories;
  
    const proteinPercent = Math.round((proteinCalories / totalCalories) * 100);
    const fatPercent = Math.round((fatCalories / totalCalories) * 100);
    const carbPercent = 100 - proteinPercent - fatPercent;
  
    return {
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fats: Math.round(fatGrams),
  
      proteinCalories: Math.round(proteinCalories),
      carbCalories: Math.round(carbCalories),
      fatCalories: Math.round(fatCalories),
  
      proteinPercent,
      carbPercent,
      fatPercent,
    };
  
  }, [profile, calorieTarget]);

  const goalValidation = bmi ? validateGoal(bmi, goal) : null;

  const handleGenerate = async () => {
    if (!profile || loading) return;
  
    if (goalValidation && !goalValidation.valid) {
      toast({
        title: "Safety Warning",
        description: goalValidation.message,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      await saveProfileAPI({
        age: profile.age,
        height_cm: profile.height,
        weight_kg: profile.weight,
        gender: profile.gender,
        activity_level: profile.activityLevel,
        goal: profile.goal,
        food_preference: foodType,
        medical_history: profile.medical_history,
      });
      saveProfile(profile);
      toast({
        title: "Profile Saved",
        description: "Your profile has been synced to your account."
      });
    } catch (err) {
      console.warn("API profile save failed, falling back to local storage.", err);
      saveProfile(profile);
    }

    try {
      const data = await createPlan({
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        gender: profile.gender,
        activity: profile.activityLevel,
        goal: profile.goal,
        food_type: foodType,
        medical_history: profile.medical_history,
      });

      setPlan(data);
      setIsModalOpen(false); // Close modal on success
      setTimeout(() => {
        planRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);

      toast({
        title: "Plan Generated",
        description: "AI recommendation successful!"
      });
  
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Hero Header */}
      <motion.div variants={item} className="mb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-emerald-400 to-cyan-500 bg-clip-text text-transparent pb-1">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Your personalized fitness journey starts here.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="glass-card hover:bg-primary/10 transition-colors">
              <Edit3 className="w-4 h-4 mr-2 text-primary" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto glass-card">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">Your Profile details</DialogTitle>
              <DialogDescription>
                Update your metrics so our AI can generate the perfect plan for you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={activity} onValueChange={(v) => setActivity(v as UserProfile["activityLevel"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Lightly Active</SelectItem>
                    <SelectItem value="moderate">Moderately Active</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Goal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as UserProfile["goal"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cut">Cut (Lose Fat)</SelectItem>
                    <SelectItem value="bulk">Bulk (Gain Muscle)</SelectItem>
                    <SelectItem value="maintain">Maintain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Food Preference</Label>
                <Select value={foodType} onValueChange={(v) => setFoodType(v as "veg" | "nonveg" | "vegan")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Medical History</Label>
                <Select value={medicalHistory} onValueChange={(v) => setMedicalHistory(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Diabetes">Diabetes</SelectItem>
                    <SelectItem value="Hypertension">Hypertension</SelectItem>
                    <SelectItem value="Thyroid Disorder">Thyroid Disorder</SelectItem>
                    <SelectItem value="Joint Issues">Joint Issues</SelectItem>
                    <SelectItem value="Asthma">Asthma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {goalValidation && !goalValidation.valid && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {goalValidation.message}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={!profile || loading}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </div>
                ) : (
                  "Save & Generate Plan"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Quick Stats (Bento Box side panel) */}
        <motion.div variants={item} className="lg:col-span-4 space-y-4">
          <Card className="glass-card hover:-translate-y-1 hover:shadow-2xl hover:border-pink-500/30 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Activity className="h-4 w-4 text-pink-500" /> BMI
                </div>
                {bmiCat && <Badge style={{ backgroundColor: bmiCat.color, color: "#fff" }} className="shadow-sm">{bmiCat.label}</Badge>}
              </div>
              <p className="text-4xl font-bold mt-2">{bmi ? bmi.toFixed(1) : "—"}</p>
            </CardContent>
          </Card>
          <Card className="glass-card hover:-translate-y-1 hover:shadow-2xl hover:border-orange-500/30 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Flame className="h-4 w-4 text-orange-500" /> BMR
              </div>
              <p className="text-4xl font-bold mt-2">{bmr ? `${Math.round(bmr)} cal` : "—"}</p>
            </CardContent>
          </Card>
          <Card className="glass-card hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Target className="h-4 w-4 text-blue-500" /> TDEE
              </div>
              <p className="text-4xl font-bold mt-2">{tdee ? `${Math.round(tdee)} cal` : "—"}</p>
            </CardContent>
          </Card>
          <Card className="glass-card hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 bg-primary/10 rounded-bl-full blur-2xl -z-10" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Utensils className="h-4 w-4 text-primary" /> Daily Target
              </div>
              <p className="text-4xl font-bold mt-2 text-primary">{calorieTarget ? `${calorieTarget} cal` : "—"}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Profile Summary & Plan (Bento Box main area) */}
        <motion.div variants={item} className="lg:col-span-8 space-y-6">
          
          {/* Profile Summary Snapshot */}
          <Card className="glass-card border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Profile Snapshot</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Goal</p>
                  <p className="font-medium capitalize">{goal.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Activity</p>
                  <p className="font-medium capitalize">{activity.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Diet</p>
                  <p className="font-medium capitalize">{foodType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Medical</p>
                  <p className="font-medium">{medicalHistory}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty State / Call to action */}
          {!plan && (
            <Card className="glass-card bg-primary/5 border-primary/20 overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center text-center p-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/0 pointer-events-none" />
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Ready to transform?</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Our AI analyzes your unique metrics to build a tailored workout and diet strategy. Generate your personalized plan to get started.
              </p>
              <Button 
                size="lg" 
                onClick={handleGenerate} 
                disabled={!profile || loading}
                className="rounded-full px-8 shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating your plan...
                  </div>
                ) : (
                  "Generate AI Plan"
                )}
              </Button>
            </Card>
          )}

          {/* Generated Plan */}
          {plan && (
            <motion.div ref={planRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="glass-card overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Dumbbell className="h-6 w-6 text-primary" /> {plan.title}
                  </CardTitle>
                  <CardDescription className="text-base">Your personalized fitness plan based on your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg"><Utensils className="h-5 w-5 text-emerald-500" /> Diet Strategy</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{plan.diet_strategy}</p>
                      <h4 className="font-medium mt-4 mb-2 text-sm uppercase tracking-wider text-muted-foreground">Example Meals</h4>
                      <ul className="space-y-2">
                        {plan.example_meals.map((m, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                             <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg"><Dumbbell className="h-5 w-5 text-primary" /> Workout Strategy</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{plan.workout_strategy}</p>
                      <h4 className="font-medium mt-4 mb-2 text-sm uppercase tracking-wider text-muted-foreground">Weekly Split</h4>
                      <ul className="space-y-2">
                        {plan.workout_split.map((d, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {macros && (
                    <div className="pt-6 border-t border-border/50">
                      <h3 className="font-semibold mb-6 text-center text-lg">
                        Optimal Macronutrient Split
                      </h3>
                      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="w-full max-w-[250px]">
                          <Pie
                            data={{
                              labels: ["Protein", "Carbs", "Fats"],
                              datasets: [
                                {
                                  data: [
                                    macros.proteinCalories,
                                    macros.carbCalories,
                                    macros.fatCalories
                                  ],
                                  backgroundColor: [
                                    "#10b981", // vibrant emerald
                                    "#6366f1", // vibrant indigo
                                    "#f43f5e"  // vibrant rose
                                  ],
                                  borderWidth: 0,
                                  hoverOffset: 10,
                                },
                              ],
                            }}
                            options={{
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  callbacks: {
                                    label: function (context) {
                                      const label = context.label;
                                      if (label === "Protein") return `Protein: ${macros.protein}g (${macros.proteinCalories} kcal)`;
                                      if (label === "Carbs") return `Carbs: ${macros.carbs}g (${macros.carbCalories} kcal)`;
                                      if (label === "Fats") return `Fats: ${macros.fats}g (${macros.fatCalories} kcal)`;
                                      return "";
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-auto">
                           <div className="flex items-center gap-3">
                             <div className="w-4 h-4 rounded-full bg-[#10b981]" />
                             <div>
                               <p className="font-medium leading-none">Protein</p>
                               <p className="text-sm text-muted-foreground">{macros.proteinPercent}% ({macros.protein}g)</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-3">
                             <div className="w-4 h-4 rounded-full bg-[#6366f1]" />
                             <div>
                               <p className="font-medium leading-none">Carbs</p>
                               <p className="text-sm text-muted-foreground">{macros.carbPercent}% ({macros.carbs}g)</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-3">
                             <div className="w-4 h-4 rounded-full bg-[#f43f5e]" />
                             <div>
                               <p className="font-medium leading-none">Fats</p>
                               <p className="text-sm text-muted-foreground">{macros.fatPercent}% ({macros.fats}g)</p>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Meta Section */}
                  <div className="mt-8 p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> AI Decision Insights
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.explanation}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium">
                      <span className="bg-background/50 px-3 py-1 rounded-md border border-border">
                        <span className="text-muted-foreground mr-1">Model:</span> {plan.model_type}
                      </span>
                      <span className="bg-background/50 px-3 py-1 rounded-md border border-border flex items-center gap-2">
                        <span className="text-muted-foreground">Confidence:</span> {plan.confidence}%
                        <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${plan.confidence}%`,
                              backgroundColor:
                                plan.confidence >= 80 ? "#10b981" : plan.confidence >= 60 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
