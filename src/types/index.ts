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