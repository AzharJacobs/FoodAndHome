import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Check, Plus } from 'lucide-react';
import { UserInfo, MealOption } from '../types';

interface IngredientsPageProps {
  userInfo: UserInfo;
  selectedMeals: MealOption[];
  onBack: () => void;
}

interface Ingredient {
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

interface IngredientsByCategory {
  [category: string]: Ingredient[];
}

export default function IngredientsPage({ userInfo, selectedMeals, onBack }: IngredientsPageProps) {
  const [ingredients, setIngredients] = useState<IngredientsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateIngredients();
  }, []);

  const generateIngredients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.');
      }

      const mealNames = selectedMeals.map(meal => meal.name).join(', ');
      
      const prompt = `Create a comprehensive shopping list for these meals: ${mealNames}

      Consider:
      - Serving size for ${userInfo.age}-year-old ${userInfo.gender}
      - Diet type: ${userInfo.dietType}
      - Budget: ${userInfo.budget}
      - Plan for 7 days

      Please provide a JSON response with ingredients organized by category:
      {
        "Proteins": [
          {"name": "Chicken breast", "amount": "2 lbs", "category": "Proteins", "checked": false}
        ],
        "Vegetables": [
          {"name": "Spinach", "amount": "1 bag", "category": "Vegetables", "checked": false}
        ],
        "Grains & Starches": [],
        "Dairy & Eggs": [],
        "Pantry Items": [],
        "Fruits": [],
        "Herbs & Spices": []
      }

      Include realistic amounts for a week's worth of meals. Group similar items together and avoid duplicates.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional nutritionist and meal planning expert. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ingredients list. Please try again.');
      }

      const data = await response.json();
      const ingredientsData = JSON.parse(data.choices[0].message.content);
      
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Error generating ingredients:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate ingredients list');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (category: string, index: number) => {
    setIngredients(prev => ({
      ...prev,
      [category]: prev[category].map((ingredient, i) => 
        i === index ? { ...ingredient, checked: !ingredient.checked } : ingredient
      )
    }));
  };

  const getTotalItems = () => {
    return Object.values(ingredients).flat().length;
  };

  const getCheckedItems = () => {
    return Object.values(ingredients).flat().filter(item => item.checked).length;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Generating Your Shopping List</h2>
          <p className="text-gray-600">Creating a personalized ingredients list based on your selected meals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Generation Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={generateIngredients}
              className="bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-black">Shopping List</h1>
          <div className="text-sm text-gray-600">
            {getCheckedItems()}/{getTotalItems()} items
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Shopping Progress</h2>
          <span className="text-2xl font-bold text-black">
            {Math.round((getCheckedItems() / getTotalItems()) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-black h-3 rounded-full transition-all duration-300"
            style={{ width: `${(getCheckedItems() / getTotalItems()) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="space-y-8">
          {Object.entries(ingredients).map(([category, items]) => (
            items.length > 0 && (
              <div key={category} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {category}
                </h3>
                
                <div className="space-y-3">
                  {items.map((ingredient, index) => (
                    <div 
                      key={index}
                      onClick={() => toggleIngredient(category, index)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        ingredient.checked 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        ingredient.checked 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        {ingredient.checked && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className={`font-medium transition-all ${
                          ingredient.checked 
                            ? 'text-gray-500 line-through' 
                            : 'text-black'
                        }`}>
                          {ingredient.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {ingredient.amount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={generateIngredients}
            className="bg-black text-white py-4 px-8 rounded-xl font-semibold hover:bg-gray-800 transition-colors mr-4"
          >
            Regenerate List
          </button>
          <button
            onClick={onBack}
            className="bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Meal Plan
          </button>
        </div>
      </div>
    </div>
  );
}