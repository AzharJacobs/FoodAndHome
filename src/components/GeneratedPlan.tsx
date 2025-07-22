import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Download, RefreshCw, Calendar, Target, Clock } from 'lucide-react';
import { UserInfo, MealOption, GeneratedMealPlan } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface GeneratedPlanProps {
  userInfo: UserInfo;
  selectedMeals: MealOption[];
  onBack: () => void;
  onRegenerate: () => void;
  onViewIngredients: () => void;
}

export default function GeneratedPlan({ userInfo, selectedMeals, onBack, onRegenerate, onViewIngredients }: GeneratedPlanProps) {
  const [mealPlan, setMealPlan] = useState<GeneratedMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const mealPlanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateMealPlan();
  }, []);

  useEffect(() => {
    // Auto-download PDF when meal plan is generated
    if (mealPlan && !loading && !error) {
      setTimeout(() => {
        downloadPDF();
      }, 1000); // Small delay to ensure rendering is complete
    }
  }, [mealPlan, loading, error]);

  const generateMealPlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.');
      }

      const prompt = `Create a personalized 7-day meal plan for a ${userInfo.age}-year-old ${userInfo.gender} with the following specifications:
      
      - Weight: ${userInfo.weight}${userInfo.units === 'imperial' ? 'lbs' : 'kg'}
      - Activity Level: ${userInfo.activityLevel}
      - Goal: ${userInfo.weightGoal}
      - Diet Type: ${userInfo.dietType}
      - Budget: ${userInfo.budget}
      - Daily Meals: ${userInfo.dailyMeals.join(', ')}
      ${selectedMeals.length > 0 ? `- Preferred meals: ${selectedMeals.map(m => m.name).join(', ')}` : ''}
      
      Please provide a JSON response with the following structure:
      {
        "days": [
          {
            "day": "Monday",
            "meals": {
              "breakfast": "meal name",
              "lunch": "meal name", 
              "dinner": "meal name",
              "snack": "meal name"
            }
          }
        ],
        "nutritionInfo": {
          "totalCalories": 2000,
          "protein": 150,
          "carbs": 200,
          "fat": 80
        }
      }
      
      Make the meals varied, nutritious, and aligned with the user's goals. Include only the meals that the user selected in their daily meals preference.`;

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
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan. Please try again.');
      }

      const data = await response.json();
      const mealPlanData = JSON.parse(data.choices[0].message.content);
      
      setMealPlan(mealPlanData);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!mealPlan || !mealPlanRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(mealPlanRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('my-meal-plan.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getMealImage = (mealName: string) => {
    // Simple mapping for meal images - in a real app, this would be more sophisticated
    const mealImages: { [key: string]: string } = {
      'overnight oats': 'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg?auto=compress&cs=tinysrgb&w=150',
      'avocado toast': 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=150',
      'greek yogurt': 'https://images.pexels.com/photos/1098592/pexels-photo-1098592.jpeg?auto=compress&cs=tinysrgb&w=150',
      'grilled chicken': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=150',
      'salmon': 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=150',
      'quinoa': 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=150',
      'turkey': 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=150',
      'eggs': 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=150',
      'soup': 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=150',
      'nuts': 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=150',
      'smoothie': 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=150',
      'default': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=150'
    };

    const lowerMealName = mealName.toLowerCase();
    for (const [key, image] of Object.entries(mealImages)) {
      if (lowerMealName.includes(key)) {
        return image;
      }
    }
    return mealImages.default;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Generating Your Personalized Meal Plan</h2>
          <p className="text-gray-600">Our AI is creating the perfect meal plan based on your preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Generation Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={generateMealPlan}
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

  if (!mealPlan) return null;

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
          <h1 className="text-2xl font-bold text-black">Your AI-Generated Meal Plan</h1>
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Download PDF"
            >
              {isDownloading ? (
                <RefreshCw className="w-6 h-6 text-gray-600 animate-spin" />
              ) : (
                <Download className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <button
              onClick={generateMealPlan}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Regenerate Plan"
            >
              <RefreshCw className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Meal Plan Content */}
      <div ref={mealPlanRef} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Nutrition Summary */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Daily Nutrition Target
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{mealPlan.nutritionInfo.totalCalories}</div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{mealPlan.nutritionInfo.protein}g</div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{mealPlan.nutritionInfo.carbs}g</div>
              <div className="text-sm text-gray-600">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{mealPlan.nutritionInfo.fat}g</div>
              <div className="text-sm text-gray-600">Fat</div>
            </div>
          </div>
        </div>

        {/* Weekly Plan - Styled like your image */}
        <div className="space-y-8">
          {mealPlan.days.map((day, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                {day.day}
              </h3>
              
              <div className="space-y-4">
                {Object.entries(day.meals).map(([mealType, mealName]) => (
                  <div key={mealType} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={getMealImage(mealName)}
                      alt={mealName}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-black">{mealName}</div>
                      <div className="text-sm text-gray-600 capitalize flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mealType}
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={generateMealPlan}
            className="bg-black text-white py-4 px-8 rounded-xl font-semibold hover:bg-gray-800 transition-colors mr-4"
          >
            Generate New Plan
          </button>
          <button
            onClick={onViewIngredients}
            className="bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors mr-4"
          >
            View Shopping List
          </button>
          <button
            onClick={downloadPDF}
            disabled={isDownloading}
            className="bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}