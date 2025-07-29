export interface UserInfo {
  gender: 'male' | 'female';
  age: number;
  units: 'imperial' | 'metric';
  height: {
    feet?: number;
    inches?: number;
    cm?: number;
  };
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  weightGoal: 'lose-fat' | 'maintain' | 'gain-muscle';
  weeklyVariety: number;
  maxComplexity: number;
  dailyMeals: string[];
  dietType: 'anything' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
  budget: 'low' | 'medium' | 'high' | 'premium';
}

export interface MealOption {
  id: string;
  name: string;
  image: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  selected?: boolean;
}

export interface WeeklySchedule {
  startDay: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
}

export interface GeneratedMealPlan {
  days: {
    day: string;
    meals: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snack?: string;
    };
  }[];
  nutritionInfo: {
    totalCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// NEW INTERFACES FOR FOOD AND HOME API

export interface FoodAndHomePost {
  id: number;
  date: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  acf?: any; // WordPress Advanced Custom Fields if they use them
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface Recipe {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  category: RecipeCategory;
  ingredients?: string[];
  instructions?: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: string;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'vegan-veg' | 'meats' | 'desserts';

export const FOOD_AND_HOME_CATEGORIES = {
  breakfast: 2608,
  lunch: 26191,
  'vegan-veg': 2602,
  meats: 26234,
  dinner: 2609,
  desserts: 2593,
} as const;

export interface APIResponse {
  posts: FoodAndHomePost[];
  totalPages: number;
  totalPosts: number;
}

export interface MealPlanWithRecipes {
  days: {
    day: string;
    meals: {
      breakfast?: Recipe;
      lunch?: Recipe;
      dinner?: Recipe;
      snack?: Recipe;
    };
  }[];
  nutritionInfo: {
    totalCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}