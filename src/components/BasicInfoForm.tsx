import React, { useState } from 'react';
import { UserInfo } from '../types';
import { ChevronRight } from 'lucide-react';

interface BasicInfoFormProps {
  onNext: (data: UserInfo) => void;
}

export default function BasicInfoForm({ onNext }: BasicInfoFormProps) {
  const [formData, setFormData] = useState<UserInfo>({
    gender: 'male',
    age: 30,
    units: 'imperial',
    height: { feet: 5, inches: 8 },
    weight: 185,
    activityLevel: 'moderate',
    weightGoal: 'maintain',
    weeklyVariety: 2,
    maxComplexity: 2,
    dailyMeals: ['breakfast', 'lunch', 'dinner'],
    dietType: 'anything',
    budget: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const updateHeight = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      height: { ...prev.height, [key]: value }
    }));
  };

  const toggleMeal = (meal: string) => {
    setFormData(prev => ({
      ...prev,
      dailyMeals: prev.dailyMeals.includes(meal)
        ? prev.dailyMeals.filter(m => m !== meal)
        : [...prev.dailyMeals, meal]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Image container above the form */}
      <div className="mb-8 text-center">
        <img 
          src="/Images/Food-Home-Logo-2-1.png" 
          alt="Meal planning illustration" 
          className="w-full max-w-md mx-auto rounded-2xl shadow-lg object-cover"
          // style={{ height: '100px'}}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Create Your Meal Plan</h1>
          <p className="text-gray-600">Tell us about yourself to get personalized recommendations</p>
        </div>

        <div className="flex border-b border-gray-200 mb-8">
          <button className="px-6 py-3 border-b-2 border-black text-black font-semibold">
            Basic
          </button>
          <button className="px-6 py-3 text-gray-500">
            Advanced
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
              <select
                value={formData.units}
                onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value as 'imperial' | 'metric' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="imperial">Imperial</option>
                <option value="metric">Metric</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
              <div className="flex gap-2">
                {formData.units === 'imperial' ? (
                  <>
                    <input
                      type="number"
                      value={formData.height.feet || ''}
                      onChange={(e) => updateHeight('feet', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="ft"
                    />
                    <input
                      type="number"
                      value={formData.height.inches || ''}
                      onChange={(e) => updateHeight('inches', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="in"
                    />
                  </>
                ) : (
                  <input
                    type="number"
                    value={formData.height.cm || ''}
                    onChange={(e) => updateHeight('cm', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="cm"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder={formData.units === 'imperial' ? 'lbs' : 'kg'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, activityLevel: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very-active">Very Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight Goal</label>
              <select
                value={formData.weightGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, weightGoal: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="lose-fat">Lose Fat</option>
                <option value="maintain">Maintain</option>
                <option value="gain-muscle">Gain Muscle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Variety</label>
              <select
                value={formData.weeklyVariety}
                onChange={(e) => setFormData(prev => ({ ...prev, weeklyVariety: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Recipe Complexity</label>
              <select
                value={formData.maxComplexity}
                onChange={(e) => setFormData(prev => ({ ...prev, maxComplexity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value={1}>1 (Simple)</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5 (Complex)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Meals</label>
              <div className="space-y-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                  <label key={meal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dailyMeals.includes(meal)}
                      onChange={() => toggleMeal(meal)}
                      className="mr-2 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="capitalize text-sm">{meal}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
              <select
                value={formData.dietType}
                onChange={(e) => setFormData(prev => ({ ...prev, dietType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="anything">Anything</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="low">$ Low</option>
                <option value="medium">$$ Medium</option>
                <option value="high">$$$ High</option>
                <option value="premium">$$$$ Premium</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            Generate Meal Plan
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}