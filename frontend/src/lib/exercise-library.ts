export interface Exercise {
  name: string;
  muscleGroup: string;
  media: string;
  tips: string[];
}

export const EXERCISE_LIBRARY: Record<string, Exercise[]> = {
  Chest: [
    {
      name: "Bench Press",
      muscleGroup: "Chest",
      media: "/exercises/chest/bench-press.mp4",
      tips: [
        "Keep shoulder blades retracted",
        "Control the bar on the way down",
        "Do not flare elbows excessively"
      ]
    },
    {
      name: "Incline Bench Press",
      muscleGroup: "Chest",
      media: "/exercises/chest/incline-bench-press.mp4",
      tips: [
        "Set bench at 30–45°",
        "Do not arch excessively",
        "Lower bar to upper chest"
      ]
    },
    {
      name: "Machine Pec Fly",
      muscleGroup: "Chest",
      media: "/exercises/chest/machine-pec-fly.mp4",
      tips: [
        "Keep slight bend in elbows",
        "Squeeze chest at center",
        "Control the eccentric phase"
      ]
    },
    {
      name: "Dumbbell Fly",
      muscleGroup: "Chest",
      media: "/exercises/chest/dumbbell-fly.mp4",
      tips: [
        "Do not overstretch",
        "Keep slight elbow bend",
        "Control movement"
      ]
    },
    {
      name: "Push-Up",
      muscleGroup: "Chest",
      media: "/exercises/chest/push-up.mp4",
      tips: [
        "Keep body straight",
        "Engage core",
        "Lower chest fully"
      ]
    }
  ],

  Back: [
    {
      name: "Deadlift",
      muscleGroup: "Back",
      media: "/exercises/back/deadlift.mp4",
      tips: [
        "Keep neutral spine",
        "Bar close to body",
        "Drive through heels"
      ]
    },
    {
      name: "Lat Pulldown",
      muscleGroup: "Back",
      media: "/exercises/back/lat-pulldown.mp4",
      tips: [
        "Pull to upper chest",
        "Control return",
        "Avoid swinging"
      ]
    },
    {
      name: "Pull-Up",
      muscleGroup: "Back",
      media: "/exercises/back/pull-up.mp4",
      tips: [
        "Full stretch at bottom",
        "Pull chest to bar",
        "Avoid kipping"
      ]
    },
    {
      name: "Seated Cable Row",
      muscleGroup: "Back",
      media: "/exercises/back/seated-cable-row.mp4",
      tips: [
        "Keep chest upright",
        "Squeeze shoulder blades",
        "Control tempo"
      ]
    },
    {
      name: "Face Pull",
      muscleGroup: "Back",
      media: "/exercises/back/face-pull.mp4",
      tips: [
        "Pull toward forehead",
        "Elbows high",
        "Control movement"
      ]
    }
  ],

  Legs: [
    {
      name: "Squat",
      muscleGroup: "Legs",
      media: "/exercises/legs/squat.mp4",
      tips: [
        "Keep chest upright",
        "Push knees outward",
        "Break at hips first"
      ]
    },
    {
      name: "Leg Press",
      muscleGroup: "Legs",
      media: "/exercises/legs/leg-press.mp4",
      tips: [
        "Do not lock knees",
        "Control movement",
        "Push through heels"
      ]
    },
    {
      name: "Romanian Deadlift",
      muscleGroup: "Legs",
      media: "/exercises/legs/romanian-deadlift.mp4",
      tips: [
        "Keep back straight",
        "Hinge at hips",
        "Feel hamstring stretch"
      ]
    },
    {
      name: "Leg Curl",
      muscleGroup: "Legs",
      media: "/exercises/legs/leg-curl.mp4",
      tips: [
        "Control eccentric",
        "Avoid hip lifting",
        "Squeeze at top"
      ]
    },
    {
      name: "Leg Extension",
      muscleGroup: "Legs",
      media: "/exercises/legs/leg-extension.mp4",
      tips: [
        "Pause at top",
        "Do not swing",
        "Control lowering"
      ]
    },
    {
      name: "Calf Raises",
      muscleGroup: "Legs",
      media: "/exercises/legs/calf-raises.mp4",
      tips: [
        "Full stretch at bottom",
        "Pause at top contraction",
        "Control the movement slowly"
      ]
    }
  ],

  Shoulders: [
    {
      name: "Overhead Press",
      muscleGroup: "Shoulders",
      media: "/exercises/shoulders/overhead-press.mp4",
      tips: [
        "Engage core",
        "Do not overarch",
        "Press straight overhead"
      ]
    },
    {
      name: "Dumbbell Shoulder Press",
      muscleGroup: "Shoulders",
      media: "/exercises/shoulders/dumbbell-shoulder-press.mp4",
      tips: [
        "Control descent",
        "Do not lock elbows hard",
        "Keep wrists neutral"
      ]
    },
    {
      name: "Dumbbell Lateral Raise",
      muscleGroup: "Shoulders",
      media: "/exercises/shoulders/dumbbell-lateral-raise.mp4",
      tips: [
        "Slight elbow bend",
        "Lift to shoulder height",
        "Control motion"
      ]
    },
    {
      name: "Front Raise",
      muscleGroup: "Shoulders",
      media: "/exercises/shoulders/front-raise.mp4",
      tips: [
        "Do not swing",
        "Raise to shoulder level",
        "Slow eccentric"
      ]
    },
    {
      name: "Rear Delt Fly",
      muscleGroup: "Shoulders",
      media: "/exercises/shoulders/rear-delt-fly.mp4",
      tips: [
        "Keep back neutral",
        "Squeeze rear delts",
        "Control movement"
      ]
    },
  ],

  Arms: [
    {
      name: "Barbell Curl",
      muscleGroup: "Arms",
      media: "/exercises/arms/barbell-curl.mp4",
      tips: [
        "Keep elbows fixed",
        "Avoid swinging",
        "Control the eccentric phase"
      ]
    },
    {
      name: "Dumbbell Curl",
      muscleGroup: "Arms",
      media: "/exercises/arms/dumbbell-curl.mp4",
      tips: [
        "Rotate wrists while lifting",
        "Do not use momentum",
        "Squeeze at the top"
      ]
    },
    {
      name: "Hammer Curl",
      muscleGroup: "Arms",
      media: "/exercises/arms/hammer-curl.mp4",
      tips: [
        "Keep neutral grip",
        "Control the motion",
        "Avoid shoulder movement"
      ]
    },
    {
      name: "Tricep Pushdown",
      muscleGroup: "Arms",
      media: "/exercises/arms/tricep-pushdown.mp4",
      tips: [
        "Keep elbows tucked",
        "Full extension at bottom",
        "Control the return"
      ]
    },
    {
      name: "Close Grip Bench Press",
      muscleGroup: "Arms",
      media: "/exercises/arms/close-grip-bench-press.mp4",
      tips: [
        "Hands shoulder-width apart",
        "Keep elbows tucked",
        "Control bar path"
      ]
    }
  ],
};