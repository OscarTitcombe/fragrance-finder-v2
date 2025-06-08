interface QuizOption {
  label: string;
  value: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  multi?: boolean;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "gender",
    question: "Who are you shopping for?",
    options: [
      { label: "For Men", value: "for-men" },
      { label: "For Women", value: "for-women" },
      { label: "Unisex", value: "for-unisex" }
    ]
  },
  {
    id: "usage",
    question: "When will you mostly wear this fragrance?",
    multi: true,
    options: [
      { label: "Daily Wear", value: "daily-wear" },
      { label: "Office Use", value: "office-use" },
      { label: "Evening Wear", value: "evening-wear" },
      { label: "Special Events", value: "special-event" },
      { label: "Sports & Gym", value: "sporty-fragrance" }
    ]
  },
  {
    id: "profile",
    question: "What type of scent are you drawn to?",
    multi: true,
    options: [
      { label: "Fresh & Citrus", value: "fresh-citrus" },
      { label: "Woody & Earthy", value: "woody-earthy" },
      { label: "Spicy & Warm", value: "spicy-warm" },
      { label: "Sweet & Gourmand", value: "sweet-gourmand" },
      { label: "Floral", value: "floral-scent" },
      { label: "Aquatic & Clean", value: "aquatic-clean" }
    ]
  },
  {
    id: "avoid",
    question: "Are there any scent notes you dislike or want to avoid?",
    multi: true,
    options: [
      { label: "Sweet Scents", value: "avoid-sweet" },
      { label: "Musky Scents", value: "avoid-musk" },
      { label: "Floral Scents", value: "avoid-floral" },
      { label: "Fresh Scents", value: "avoid-fresh" },
      { label: "Woody Scents", value: "avoid-woody" }
    ]
  },
  {
    id: "intensity",
    question: "How strong do you want the scent to be?",
    options: [
      { label: "Light", value: "light-intensity" },
      { label: "Moderate", value: "moderate-intensity" },
      { label: "Strong", value: "strong-intensity" }
    ]
  },
  {
    id: "longevity",
    question: "How long do you want it to last on your skin?",
    options: [
      { label: "Short (2-4 hours)", value: "short-longevity" },
      { label: "Medium (4-6 hours)", value: "medium-longevity" },
      { label: "Long (6+ hours)", value: "long-longevity" }
    ]
  },
  {
    id: "season",
    question: "What kind of climate will you be wearing this in?",
    options: [
      { label: "Warm Weather", value: "warm-weather" },
      { label: "Cold Weather", value: "cold-weather" },
      { label: "All Seasons", value: "all-season" }
    ]
  },
  {
    id: "age",
    question: "What age range best fits your style or vibe?",
    options: [
      { label: "Under 25", value: "age-under-25" },
      { label: "26-35", value: "age-26-35" },
      { label: "36-45", value: "age-36-45" },
      { label: "46+", value: "age-46-plus" }
    ]
  },
  {
    id: "brand",
    question: "Do you prefer popular brands or hidden gems?",
    options: [
      { label: "Designer Brands", value: "designer-brand" },
      { label: "Niche Brands", value: "niche-brand" },
      { label: "Any Brand", value: "any-brand" }
    ]
  },
  {
    id: "budget",
    question: "What's your budget?",
    options: [
      { label: "Under $50", value: "budget-low" },
      { label: "$50-$100", value: "budget-mid" },
      { label: "$100-$200", value: "budget-high" },
      { label: "$200+", value: "budget-luxury" }
    ]
  }
]; 