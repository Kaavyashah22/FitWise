export interface FitnessPlan {
  title: string;
  diet_strategy: string;
  example_meals: string[];
  workout_strategy: string;
  workout_split: string[];
  explanation: string;
  confidence: number;
  model_type: string;
}