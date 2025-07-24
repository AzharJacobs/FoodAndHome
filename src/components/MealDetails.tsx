import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MealDetails = () => {
  const { mealName } = useParams<{ mealName: string }>();
  const [mealDetails, setMealDetails] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealDetails = async () => {
      setLoading(true);
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      const prompt = `
        Provide a detailed recipe for the meal "${mealName}".
        Include:
        - A list of ingredients
        - Preparation time
        - Step-by-step cooking instructions
      `;

      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        });

        const data = await res.json();
        setMealDetails(data.choices[0].message.content);
      } catch (err) {
        setMealDetails("⚠️ Failed to load meal details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetails();
  }, [mealName]);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>

      <div className="text-center mb-8">
        <img 
          src="/Food-Home-logo-2-1.png" 
          alt="Food & Home" 
          className="h-16 mx-auto mb-4"
        />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">{mealName}</h1>

      {loading ? (
        <div className="text-gray-600 animate-pulse">Loading meal details...</div>
      ) : (
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {mealDetails}
        </div>
      )}
    </div>
  );
};

export default MealDetails;
