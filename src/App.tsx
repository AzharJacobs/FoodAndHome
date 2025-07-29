import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserInfo, MealOption, FoodAndHomePost, FOOD_AND_HOME_CATEGORIES } from './types';

import BasicInfoForm from './components/BasicInfoForm';
import DaySelection from './components/DaySelection';
import MealSelection from './components/MealSelection';
import GeneratedPlan from './components/GeneratedPlan';
import IngredientsPage from './components/IngredientsPage';
import MealDetails from './components/MealDetails';

type Step = 'basic-info' | 'day-selection' | 'meal-selection' | 'generated-plan' | 'ingredients';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [startDay, setStartDay] = useState<string>('');
  const [selectedMeals, setSelectedMeals] = useState<MealOption[]>([]);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<any>(null);
  const [aiMealOptions, setAiMealOptions] = useState<MealOption[] | null>(null);
  const [mealOptionsLoading, setMealOptionsLoading] = useState(false);
  const [mealOptionsError, setMealOptionsError] = useState<string | null>(null);

  // Convert Food & Home API response to MealOption format
  const convertToMealOption = (post: FoodAndHomePost, category: string): MealOption => {
    // Extract featured image URL from content or use embedded media
    let imageUrl = '/placeholder-recipe.jpg'; // Default fallback
    
    // Try to get image from embedded media first
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
    } else {
      // Try to extract image from content HTML
      const imgMatch = post.content.rendered.match(/src="([^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      }
    }

    // Map Food & Home categories to our app categories
    const categoryMap: { [key: string]: 'breakfast' | 'lunch' | 'dinner' | 'snack' } = {
      'breakfast': 'breakfast',
      'lunch': 'lunch',
      'dinner': 'dinner',
      'vegan-veg': 'lunch', // Map vegan-veg to lunch as default
      'meats': 'dinner',    // Map meats to dinner as default
      'desserts': 'snack'   // Map desserts to snack
    };

    return {
      id: post.id.toString(),
      name: post.title.rendered
        .replace(/&amp;/g, '&')
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, "-")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"'), // Clean up HTML entities
      image: imageUrl,
      category: categoryMap[category] || 'lunch'
    };
  };

  // Parse ingredients and instructions from Food & Home content
  const parseRecipeData = (content: string) => {
    const ingredients: string[] = [];
    const instructions: string[] = [];
    
    // Extract ingredients from HTML
    const ingredientMatches = content.match(/<li><span>([^<]+)<\/span><\/li>/g);
    if (ingredientMatches) {
      ingredientMatches.forEach(match => {
        const ingredient = match.match(/<span>([^<]+)<\/span>/)?.[1];
        if (ingredient) {
          ingredients.push(ingredient.trim());
        }
      });
    }
    
    // Extract instructions from step divs
    const stepMatches = content.match(/<div class="step-content">\s*<p>([^<]+)<\/p>/g);
    if (stepMatches) {
      stepMatches.forEach(match => {
        const instruction = match.match(/<p>([^<]+)<\/p>/)?.[1];
        if (instruction) {
          instructions.push(instruction.trim());
        }
      });
    }
    
    return { ingredients, instructions };
  };

  // Fetch recipes from your backend proxy instead of directly from Food & Home
  const fetchFoodAndHomeRecipes = async (categoryKey: string, limit: number = 3): Promise<MealOption[]> => {
    try {
      console.log(`Fetching ${categoryKey} recipes from backend...`);
      
      // Use your backend API endpoint
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/recipes/${categoryKey}?limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Backend returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Backend request failed');
      }
      
      // Transform backend response to MealOption format
      const mealOptions = data.recipes.map((recipe: any): MealOption => ({
        id: recipe.id,
        name: recipe.name,
        image: recipe.image || '/placeholder-recipe.jpg',
        category: categoryKey === 'breakfast' ? 'breakfast' : 
                 categoryKey === 'lunch' || categoryKey === 'vegan-veg' ? 'lunch' :
                 categoryKey === 'dinner' || categoryKey === 'meats' ? 'dinner' : 'snack'
      }));
      
      console.log(`✅ Successfully fetched ${mealOptions.length} ${categoryKey} recipes from backend`);
      return mealOptions;
      
    } catch (error) {
      console.error(`❌ Error fetching ${categoryKey} recipes from backend:`, error);
      throw error; // Re-throw to be handled by the calling function
    }
  };

  // Fetch meal options from Food & Home API instead of OpenAI
  const handleBasicInfoNext = async (data: UserInfo) => {
    setUserInfo(data);
    setMealOptionsLoading(true);
    setMealOptionsError(null);
    
    try {
      // Fetch recipes for each category that the user selected
      const mealPromises: Promise<MealOption[]>[] = [];
      
      // Map user's daily meals to Food & Home categories
      if (data.dailyMeals.includes('breakfast')) {
        mealPromises.push(fetchFoodAndHomeRecipes('breakfast'));
      }
      if (data.dailyMeals.includes('lunch')) {
        mealPromises.push(fetchFoodAndHomeRecipes('lunch'));
        // Also fetch some vegan options for variety
        if (data.dietType === 'vegan' || data.dietType === 'vegetarian') {
          mealPromises.push(fetchFoodAndHomeRecipes('vegan-veg'));
        }
      }
      if (data.dailyMeals.includes('dinner')) {
        mealPromises.push(fetchFoodAndHomeRecipes('dinner'));
        // Add meat recipes if not vegetarian/vegan
        if (data.dietType === 'anything') {
          mealPromises.push(fetchFoodAndHomeRecipes('meats'));
        }
      }
      if (data.dailyMeals.includes('snack')) {
        mealPromises.push(fetchFoodAndHomeRecipes('desserts'));
      }

      // If no specific meals selected, fetch from all relevant categories
      if (mealPromises.length === 0) {
        mealPromises.push(
          fetchFoodAndHomeRecipes('breakfast'),
          fetchFoodAndHomeRecipes('lunch'),
          fetchFoodAndHomeRecipes('dinner'),
          fetchFoodAndHomeRecipes('desserts')
        );
      }

      const allMealOptionsArrays = await Promise.all(mealPromises);
      const allMealOptions = allMealOptionsArrays.flat();

      if (allMealOptions.length === 0) {
        throw new Error('No recipes found from Food & Home API');
      }

      setAiMealOptions(allMealOptions);
      setCurrentStep('day-selection');
    } catch (err: any) {
      setMealOptionsError(err.message || 'Failed to fetch recipes from Food & Home');
    } finally {
      setMealOptionsLoading(false);
    }
  };

  const handleDaySelectionNext = (day: string) => {
    setStartDay(day);
    setCurrentStep('meal-selection');
  };

  const handleMealSelectionNext = (meals: MealOption[]) => {
    setSelectedMeals(meals);
    setGeneratedMealPlan(null); // Reset meal plan when meals change
    setCurrentStep('generated-plan');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'day-selection':
        setCurrentStep('basic-info');
        break;
      case 'meal-selection':
        setCurrentStep('day-selection');
        break;
      case 'generated-plan':
        setCurrentStep('meal-selection');
        break;
      case 'ingredients':
        setCurrentStep('generated-plan');
        break;
    }
  };

  const handleRegenerate = () => {
    setGeneratedMealPlan(null); // Clear existing plan to force regeneration
    setCurrentStep('generated-plan');
  };

  const handleViewIngredients = () => {
    setCurrentStep('ingredients');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <Routes>
        {/* Main multi-step app */}
        <Route
          path="/"
          element={
            <>
              {currentStep === 'basic-info' && (
                <BasicInfoForm onNext={handleBasicInfoNext} loading={mealOptionsLoading} />
              )}

              {currentStep === 'day-selection' && (
                <DaySelection onNext={handleDaySelectionNext} onBack={handleBack} />
              )}

              {currentStep === 'meal-selection' && (
                <MealSelection
                  onNext={handleMealSelectionNext}
                  onBack={handleBack}
                  userDailyMeals={userInfo?.dailyMeals || []}
                  mealOptions={aiMealOptions || []}
                  loading={mealOptionsLoading}
                  error={mealOptionsError}
                />
              )}

              {currentStep === 'generated-plan' && userInfo && (
                <GeneratedPlan
                  userInfo={userInfo}
                  selectedMeals={selectedMeals}
                  generatedMealPlan={generatedMealPlan}
                  setGeneratedMealPlan={setGeneratedMealPlan}
                  onBack={handleBack}
                  onRegenerate={handleRegenerate}
                  onViewIngredients={handleViewIngredients}
                />
              )}

              {currentStep === 'ingredients' && userInfo && (
                <IngredientsPage
                  userInfo={userInfo}
                  selectedMeals={selectedMeals}
                  generatedMealPlan={generatedMealPlan}
                  onBack={handleBack}
                />
              )}
            </>
          }
        />

        {/* AI-generated meal details view */}
        <Route path="/meal/:mealName" element={<MealDetails />} />
      </Routes>
    </div>
  );
}

export default App;