import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMenuDescription = async (dishName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "وصف تلقائي غير متاح (Missing API Key)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, appetizing description (max 20 words) in Arabic for a restaurant menu item named: "${dishName}". Make it sound delicious.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating description:", error);
    return "وصف شهي ولذيذ.";
  }
};

export const analyzeSalesPattern = async (ordersData: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "التحليل غير متاح.";
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this sales data summary in Arabic and give 2 brief strategic tips for the restaurant manager: ${ordersData}`,
      });
      return response.text.trim();
    } catch (error) {
      console.error("Error analyzing sales:", error);
      return "لا توجد بيانات كافية للتحليل.";
    }
  };