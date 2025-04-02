import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TravelFormData {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelers: string;
  interests: string;
}

const initialFormData: TravelFormData = {
  source: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  travelers: '',
  interests: '',
};

const TravelForm = () => {
  const [formData, setFormData] = useState<TravelFormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateTravelPlan = async (data: TravelFormData) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("Using API Key:", apiKey); // Debugging
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a detailed travel itinerary for a trip:
            From: ${data.source}
            To: ${data.destination}
            Dates: ${data.startDate} to ${data.endDate}
            Budget: ${data.budget}
            Number of Travelers: ${data.travelers}
            Interests: ${data.interests}
            
            Please include:
            1. Daily activities and attractions
            2. Estimated costs
            3. Transportation recommendations
            4. Accommodation suggestions
            5. Local cuisine recommendations
            6. Tips for the destination
            only include these for destination city
            `
          }]
        }]
      })
    });
    console.log("API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to generate travel plan: ${errorText}`);
    }

    const result = await response.json();
    console.log("API Response:", result);

    let travelPlan = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!travelPlan) {
      throw new Error('No travel plan generated. API may have returned an error.');
    }
      return travelPlan;
  };

  const { data: travelPlan, isLoading, error, refetch } = useQuery({
    queryKey: ['travelPlan', formData],
    queryFn: () => generateTravelPlan(formData),
    enabled: false, // Don't run on mount
  });

  useEffect(() => {
    if (isSubmitted) {
      refetch();
    }
  }, [isSubmitted, refetch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Plan Your Perfect Trip</h1>
        <p>Let our AI travel agent help you create an unforgettable journey</p>
      </div>

      <form className="travel-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="source">Starting Point</label>
          <input type="text" id="source" name="source" value={formData.source} onChange={handleInputChange} required placeholder="e.g., New York" />
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <input type="text" id="destination" name="destination" value={formData.destination} onChange={handleInputChange} required placeholder="e.g., Paris" />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="budget">Budget</label>
          <input type="text" id="budget" name="budget" value={formData.budget} onChange={handleInputChange} required placeholder="e.g., $3000" />
        </div>

        <div className="form-group">
          <label htmlFor="travelers">Number of Travelers</label>
          <input type="number" id="travelers" name="travelers" value={formData.travelers} onChange={handleInputChange} required min="1" />
        </div>

        <div className="form-group">
          <label htmlFor="interests">Interests</label>
          <textarea id="interests" name="interests" value={formData.interests} onChange={handleInputChange} required placeholder="e.g., History, Food, Adventure" rows={3} />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Generating Plan...' : 'Plan My Trip'}
        </button>
      </form>

      {isLoading && <div className="loading"><div className="loading-spinner" /></div>}
      {error && <div className="error-message">Failed to generate travel plan. Please try again.</div>}
      {travelPlan && <div className="result-card"><pre style={{ whiteSpace: 'pre-wrap' }}>{travelPlan}</pre></div>}
    </div>
  );
};

export default TravelForm;
