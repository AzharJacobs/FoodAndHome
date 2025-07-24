import React, { useState } from 'react';
import { ChevronLeft, Filter } from 'lucide-react';
import { MealOption } from '../types';

interface MealSelectionProps {
  onNext: (selectedMeals: MealOption[]) => void;
  onBack: () => void;
  userDailyMeals: string[];
}

const mealOptions: MealOption[] = [
  // Breakfast options
  { id: 'b1', name: 'Overnight Oats with Berries', image: 'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'breakfast' },
  { id: 'b2', name: 'Avocado Toast with Eggs', image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'breakfast' },
  { id: 'b3', name: 'Greek Yogurt Parfait', image: 'https://images.pexels.com/photos/1098592/pexels-photo-1098592.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'breakfast' },
  { id: 'b4', name: 'Protein Pancakes', image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'breakfast' },
  { id: 'b5', name: 'Smoothie Bowl', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'breakfast' },
  { id: 'b6', name: 'Veggie Scramble', image: 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'breakfast' },

  // Lunch options
  { id: 'l1', name: 'Grilled Chicken Salad', image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'lunch' },
  { id: 'l2', name: 'Quinoa Buddha Bowl', image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'lunch' },
  { id: 'l3', name: 'Turkey Club Wrap', image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'lunch' },
  { id: 'l4', name: 'Veggie Stir Fry', image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'lunch' },
  { id: 'l5', name: 'Mediterranean Wrap', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'lunch' },
  { id: 'l6', name: 'Soup & Salad Combo', image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'lunch' },

  // Dinner options
  { id: 'd1', name: 'Grilled Salmon with Vegetables', image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'dinner' },
  { id: 'd2', name: 'Lean Beef Stir Fry', image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'dinner' },
  { id: 'd3', name: 'Chicken Breast with Sweet Potato', image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'dinner' },
  { id: 'd4', name: 'Vegetarian Pasta', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'dinner' },
  { id: 'd5', name: 'Turkey Meatballs', image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'dinner' },
  { id: 'd6', name: 'Grilled Chicken Thighs', image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'dinner' },

  // Snack options
  { id: 's1', name: 'Mixed Nuts', image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'snack' },
  { id: 's2', name: 'Greek Yogurt with Berries', image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'snack' },
  { id: 's3', name: 'Protein Bar', image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'snack' },
  { id: 's4', name: 'Apple with Peanut Butter', image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'snack' },
  { id: 's5', name: 'Veggie Sticks with Hummus', image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'snack' },
  { id: 's6', name: 'Protein Smoothie', image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=300', category: 'snack' },
];

export default function MealSelection({ onNext, onBack, userDailyMeals }: MealSelectionProps) {
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
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

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
          Generate AI Meal Plan ({selectedMeals.length} meals selected)
        </button>
      </div>
    </div>
  );
}