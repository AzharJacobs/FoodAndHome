import React, { useState } from 'react';
import { ChevronLeft, Filter } from 'lucide-react';
import { MealOption } from '../types';

interface MealSelectionProps {
  onNext: (selectedMeals: MealOption[]) => void;
  onBack: () => void;
  userDailyMeals: string[];
  mealOptions: MealOption[];
  loading: boolean;
  error: string | null;
}

export default function MealSelection({ onNext, onBack, userDailyMeals, mealOptions, loading, error }: MealSelectionProps) {
  const [selectedMeals, setSelectedMeals] = useState<MealOption[]>([]);

  const toggleMeal = (meal: MealOption) => {
    setSelectedMeals(prev => {
      const isSelected = prev.some(m => m.id === meal.id);
      if (isSelected) {
        return prev.filter(m => m.id !== meal.id);
      } else {
        return [...prev, { ...meal, selected: true }];
      }
    });
  };

  const renderMealCategory = (category: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    // Only show categories that the user selected in their daily meals
    if (!userDailyMeals.includes(category)) {
      return null;
    }
    
    const categoryMeals = mealOptions.filter(meal => meal.category === category);
    if (categoryMeals.length === 0) return null;
    
    // Updated category name mapping to handle new categories
    const getCategoryDisplayName = (cat: string) => {
      switch (cat) {
        case 'breakfast':
          return 'Breakfast';
        case 'lunch':
          return 'Lunch';
        case 'dinner':
          return 'Dinner';
        case 'snack':
          return 'Snacks';
        default:
          return cat.charAt(0).toUpperCase() + cat.slice(1);
      }
    };

    const categoryName = getCategoryDisplayName(category);

    return (
      <div key={category} className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-2xl font-bold text-black">{categoryName}</h3>
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryMeals.map((meal) => {
            const isSelected = selectedMeals.some(m => m.id === meal.id);
            return (
              <div
                key={meal.id}
                onClick={() => toggleMeal(meal)}
                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${
                  isSelected ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    // Fallback for broken images from Food & Home API
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-recipe.jpg'; // You'll need to add a placeholder image
                  }}
                />
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-900 leading-tight">{meal.name}</h4>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Show loading or error states
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center text-lg font-semibold">
        Loading recipes from Food & Home...
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center text-lg text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-6">
        <img 
          src="/Food-Home-logo-2-1.png" 
          alt="Food & Home" 
          className="h-12 mx-auto"
        />
      </div>
      
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1 h-2 bg-gray-200 rounded-full mx-4">
          <div className="w-full h-2 bg-black rounded-full"></div>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black mb-4">Optional: Pick 1-2 recipes for each meal</h2>
        <p className="text-gray-600">Your meal plan will be built around your choices. Selected: {selectedMeals.length} meals</p>
      </div>

      <div className="space-y-8">
        {renderMealCategory('breakfast')}
        {renderMealCategory('lunch')}
        {renderMealCategory('dinner')}
        {renderMealCategory('snack')}
      </div>

      <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-12">
        <button
          onClick={() => onNext(selectedMeals)}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Generate Meal Plan ({selectedMeals.length} meals selected)
        </button>
      </div>
    </div>
  );
}