import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DaySelectionProps {
  onNext: (startDay: string) => void;
  onBack: () => void;
}

export default function DaySelection({ onNext, onBack }: DaySelectionProps) {
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  const days = [
    { id: 'sunday', label: 'Sun' },
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1 h-2 bg-gray-200 rounded-full mx-4">
          <div className="w-2/3 h-2 bg-black rounded-full"></div>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black mb-4">Start meal plan each week on:</h2>
        <p className="text-gray-600">Choose the day you'd like to begin your meal plan each week</p>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-12">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              selectedDay === day.id
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-lg font-semibold">{day.label}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => onNext(selectedDay)}
        className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        Continue to Meal Selection
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}