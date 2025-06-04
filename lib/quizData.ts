interface QuizOption {
  label: string;
  value: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "gender",
    question: "What's your gender?",
    options: [
      { label: "For Men", value: "for-men" },
      { label: "For Women", value: "for-women" },
      { label: "Unisex", value: "for-unisex" }
    ]
  },
  {
    id: "age",
    question: "What's your age group?",
    options: [
      { label: "Under 25", value: "age-under-25" },
      { label: "26-35", value: "age-26-35" },
      { label: "36-45", value: "age-36-45" },
      { label: "46+", value: "age-46-plus" }
    ]
  },
  {
    id: "usage",
    question: "When do you mostly want to wear this fragrance?",
    options: [
      { label: "Daily Wear", value: "daily-wear" },
      { label: "Office Use", value: "office-use" },
      { label: "Evening Wear", value: "evening-wear" },
      { label: "Special Events", value: "special-event" },
      { label: "Sports & Gym", value: "sporty-fragrance" }
    ]
  },
  {
    id: "season",
    question: "What season will you wear it in most?",
    options: [
      { label: "Warm Weather", value: "warm-weather" },
      { label: "Cold Weather", value: "cold-weather" },
      { label: "All Seasons", value: "all-season" }
    ]
  },
  {
    id: "profile",
    question: "What kind of scent profile do you prefer?",
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
    id: "intensity",
    question: "How strong should it be?",
    options: [
      { label: "Light", value: "light-intensity" },
      { label: "Moderate", value: "moderate-intensity" },
      { label: "Strong", value: "strong-intensity" }
    ]
  },
  {
    id: "longevity",
    question: "How long do you want it to last?",
    options: [
      { label: "Short (2-4 hours)", value: "short-longevity" },
      { label: "Medium (4-6 hours)", value: "medium-longevity" },
      { label: "Long (6+ hours)", value: "long-longevity" }
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
  },
  {
    id: "brand",
    question: "What kind of brand are you looking for?",
    options: [
      { label: "Designer Brands", value: "designer-brand" },
      { label: "Niche Brands", value: "niche-brand" },
      { label: "Any Brand", value: "any-brand" }
    ]
  },
  {
    id: "avoid",
    question: "Is there anything you dislike?",
    options: [
      { label: "Sweet Scents", value: "avoid-sweet" },
      { label: "Musky Scents", value: "avoid-musk" },
      { label: "Floral Scents", value: "avoid-floral" },
      { label: "Fresh Scents", value: "avoid-fresh" },
      { label: "Woody Scents", value: "avoid-woody" }
    ]
  }
]; 