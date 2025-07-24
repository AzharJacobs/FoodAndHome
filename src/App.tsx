import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserInfo, MealOption } from './types';

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

  // Fetch AI meal options after basic info submit
  const handleBasicInfoNext = async (data: UserInfo) => {
    setUserInfo(data);
    setMealOptionsLoading(true);
    setMealOptionsError(null);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const prompt = `Given the following user profile, recommend 6 breakfast, 6 lunch, 6 dinner, and 6 snack meal options as a JSON array of objects (with id, name, image, and category fields). User profile: ${JSON.stringify(data)}. Only return the array, no explanation.`;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });
      const aiData = await res.json();
      const content = aiData.choices?.[0]?.message?.content;
      let parsed: MealOption[] = [];
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        // Try to extract JSON from text
        const jsonMatch = content.match(/\[.*\]/s);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse AI meal options response");
        }
      }
      setAiMealOptions(parsed);
      setCurrentStep('day-selection');
    } catch (err: any) {
      setMealOptionsError(err.message || 'Failed to get meal options from AI');
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
                <BasicInfoForm onNext={handleBasicInfoNext} />
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
