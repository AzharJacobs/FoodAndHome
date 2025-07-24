import React, { useState } from 'react';
import { UserInfo, MealOption } from './types';
import BasicInfoForm from './components/BasicInfoForm';
import DaySelection from './components/DaySelection';
import MealSelection from './components/MealSelection';
import GeneratedPlan from './components/GeneratedPlan';
import IngredientsPage from './components/IngredientsPage';

type Step = 'basic-info' | 'day-selection' | 'meal-selection' | 'generated-plan' | 'ingredients';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [startDay, setStartDay] = useState<string>('');
  const [selectedMeals, setSelectedMeals] = useState<MealOption[]>([]);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<any>(null);

  const handleBasicInfoNext = (data: UserInfo) => {
    setUserInfo(data);
    setCurrentStep('day-selection');
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
      {currentStep === 'basic-info' && (
        <BasicInfoForm onNext={handleBasicInfoNext} />
      )}
      
      {currentStep === 'day-selection' && (
        <DaySelection 
          onNext={handleDaySelectionNext}
          onBack={handleBack}
        />
      )}
      
      {currentStep === 'meal-selection' && (
        <MealSelection 
          onNext={handleMealSelectionNext}
          onBack={handleBack}
          userDailyMeals={userInfo?.dailyMeals || []}
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
    </div>
  );
}

export default App;