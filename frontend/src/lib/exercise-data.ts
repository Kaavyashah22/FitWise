export const EXERCISE_DETAILS: Record<
  string,
  {
    video: string;
    muscle: string;
    tips: string[];
  }
> = {
  "Bench Press": {
    video: "https://www.youtube.com/embed/gRVjAtPip0Y",
    muscle: "Chest",
    tips: [
      "Keep shoulder blades retracted",
      "Lower the bar in control",
      "Do not flare elbows excessively"
    ]
  },

  "Squat": {
    video: "https://www.youtube.com/embed/ultWZbUMPL8",
    muscle: "Quadriceps & Glutes",
    tips: [
      "Keep chest upright",
      "Push knees outward",
      "Break at hips first"
    ]
  },

  "Deadlift": {
    video: "https://www.youtube.com/embed/op9kVnSso6Q",
    muscle: "Hamstrings & Back",
    tips: [
      "Keep neutral spine",
      "Bar close to shins",
      "Drive through heels"
    ]
  }
};