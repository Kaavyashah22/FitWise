import { useState, useMemo, useRef } from "react";
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
import { Activity, Flame, Target, AlertTriangle, Utensils, Dumbbell, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [foodType, setFoodType] = useState<"veg" | "nonveg" | "vegan">("nonveg");
  const planRef = useRef<HTMLDivElement | null>(null);

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
    };
  }, [user, age, height, weight, gender, activity, goal]);

  const bmi = profile ? calculateBMI(profile.weight, profile.height) : null;
  const bmiCat = bmi ? getBMICategory(bmi) : null;
  const bmr = profile ? calculateBMR(profile) : null;
  const tdee = profile ? calculateTDEE(profile) : null;
  const calorieTarget = tdee && profile ? getCalorieTarget(tdee, profile.goal) : null;

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender,
          activity: profile.activityLevel,
          goal: profile.goal,
          food_type: foodType
        })
      });
  
      const data = await response.json();
      console.log("API RESPONSE:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }
  
      setPlan(data);
      setTimeout(() => {
        planRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Health Dashboard</h1>
        <p className="text-muted-foreground">Calculate your metrics and get a personalized plan</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Form */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              </div>
              <div className="space-y-2">
  <Label>Food Preference</Label>
  <Select value={foodType} onValueChange={(v) => setFoodType(v as "veg" | "nonveg" | "vegan")}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="veg">Vegetarian</SelectItem>
      <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
      <SelectItem value="vegan">Vegan</SelectItem>
    </SelectContent>
  </Select>
</div>
              {goalValidation && !goalValidation.valid && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {goalValidation.message}
                </div>
              )}
              <Button
                className="mt-6 w-full sm:w-auto"
                onClick={handleGenerate}
                disabled={!profile || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </div>
                ) : (
                  "Generate Plan"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="space-y-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">BMI</span>
                {bmiCat && <Badge style={{ backgroundColor: bmiCat.color, color: "#fff" }}>{bmiCat.label}</Badge>}
              </div>
              <p className="text-3xl font-bold mt-1">{bmi ? bmi.toFixed(1) : "—"}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="h-4 w-4" /> BMR
              </div>
              <p className="text-3xl font-bold mt-1">{bmr ? `${Math.round(bmr)} cal` : "—"}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" /> TDEE
              </div>
              <p className="text-3xl font-bold mt-1">{tdee ? `${Math.round(tdee)} cal` : "—"}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Utensils className="h-4 w-4" /> Daily Target
              </div>
              <p className="text-3xl font-bold mt-1 text-primary">{calorieTarget ? `${calorieTarget} cal` : "—"}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Plan */}
      {plan && (
        <motion.div ref={planRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" /> {plan.title}
              </CardTitle>
              <CardDescription>Your personalized fitness plan based on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Utensils className="h-4 w-4 text-primary" /> Diet Strategy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.diet_strategy}</p>
                  <h4 className="font-medium mt-4 mb-2">Example Meals</h4>
                  <ul className="space-y-1">
                    {plan.example_meals.map((m, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Dumbbell className="h-4 w-4 text-primary" /> Workout Strategy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.workout_strategy}</p>
                  <h4 className="font-medium mt-4 mb-2">Weekly Split</h4>
                  <ul className="space-y-1">
                    {plan.workout_split.map((d, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* AI Meta Section */}
<div className="mt-6 p-4 rounded-lg bg-muted/40 border border-border space-y-2">
  <h3 className="font-semibold text-sm">AI Decision Insights</h3>
  <p className="text-xs text-muted-foreground leading-relaxed">
    {plan.explanation}
  </p>

  <div className="flex flex-wrap gap-4 mt-2 text-xs">
    <span>
      <strong>Model:</strong> {plan.model_type}
    </span>
    <span>
      <strong>Confidence:</strong> {plan.confidence}%
    </span>
  </div>
</div>
<div className="mt-3">
  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700 ease-out"
      style={{
        width: `${plan.confidence}%`,
        backgroundColor:
          plan.confidence >= 80
            ? "#22c55e"   // green
            : plan.confidence >= 60
            ? "#eab308"   // yellow
            : "#ef4444",  // red
      }}
    />
  </div>

  <p className="mt-1 text-[11px] text-muted-foreground">
    Model confidence based on nearest-neighbor similarity
  </p>
</div>
{plan.confidence < 60 && (
  <div className="mt-2 text-xs text-red-400">
    ⚠️ Lower confidence detected. Consider reviewing input data for more accurate recommendations.
  </div>
)}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardPage;
