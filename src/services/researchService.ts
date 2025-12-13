import { GoogleGenAI } from "@google/genai";

export const performDeepResearch = async (query: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Using the smart model for research
      contents: `Search for information about "${query}", focused on information in 2025. 
      
      Goal: Provide a comprehensive background check for Santa Claus to determine if this person/entity is Naughty or Nice based on the last year's behavior.
      
      Requirements:
      1. Find their Bio/Description.
      2. Find recent news, controversies, or good deeds (only from the 2025). If 2025 results are not available, and you must use anything from before 2025, make special note so Santa knows it's older news.
      3. Find summaries of their social media presence or public behavior, limited to 2025.
      
      Return a detailed text summary of your findings. Do not format as JSON yet, just raw information.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "No information found in the archives.";

  } catch (error) {
    console.error("Research Error:", error);
    throw new Error("The elves couldn't find any news records.");
  }
};