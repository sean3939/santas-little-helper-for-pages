import { GoogleGenAI, Type } from "@google/genai";
import { SantaVerdict } from '../types';

// System Instruction for the "Brain"
const SANTA_SYSTEM_INSTRUCTION = `
You are Santa Claus. Analyze the provided text (which may be a raw JSON export of user activity or a text summary) to determine if the person (or entity) is Naughty or Nice.
Be witty, festive, and decisive. Your tone should be magical but firm.

You must return a JSON object with the following schema:
- verdict: "Naughty" or "Nice"
- score: integer (0-100), where 0 is pure evil and 100 is pure saint.
- title: A creative nickname (e.g., "The Grumpy Troll" or "The Wholesome Helper") as well as their real name, in the style of [Name]: [Nickname].
- reasoning: Two sentences explaining why in Santa's voice. Be sure to reference specific examples from the content about that person that led to your reasoning.
- visual_prompt: A specific, creative, detailed description of the gift or punishment they receive for nano banana to use to create an image.
  - If Nice: A specific, high-quality toy, luxury item, or magical artifact, based on how nice they've been, increasing in value/rarity/magic based on how nice. Attune it to them specifically- something they might really want (or wanted).
  - If Naughty: Pending the severity of their naughtiness, a lump of coal, a wet sock, a raw onion, etc., in increasing number/magnitude based on their evil/naughty rating. The worst of the worst should have nigh infinite terrible "gifts" given the extent of their naughtiness- much more than any one person can receive, as they likely affected so many, many, many people. Make sure it's something this person would not like.
  - The visual_prompt should be a detailed, descriptive for an image generator. Make sure to present the item as a gift under the Christmas tree, or near the tree, whatever makes sense. Use stylistic modifiers for the image prompt to make it feel real, like photography terms such as analog photo, 35mm photo, film blur, film grain, etc. The focus must be on the gift/punishment item Santa has decided to give this person.
- gift_description: A single witty sentence describing strictly *what* the gift is and *why* they received it (e.g., "A bucket of coal because you trolled too many people on main.").
- suggested_gifts: If the score is 40 or above (even if they are Naughty, but not *too* naughty), provide a list of exactly 3 real, specific, purchasable gift recommendations based on their personality and interests found in the text. Each item should be an object with:
  - item_name: The specific product name (e.g. "Sony WH-1000XM5").
  - reason: A short witty reason why.
  If the score is 39 or below, return an empty array.
`;

export const judgeInput = async (text: string, apiKey: string): Promise<SantaVerdict> => {
  if (!apiKey) throw new Error("API Key is missing. Please add it in the settings.");
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // The "Brain" - High reasoning model
      contents: text,
      config: {
        systemInstruction: SANTA_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: ["Naughty", "Nice"] },
            score: { type: Type.INTEGER },
            title: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            visual_prompt: { type: Type.STRING },
            gift_description: { type: Type.STRING },
            suggested_gifts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item_name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["item_name", "reason"],
              },
            },
          },
          required: ["verdict", "score", "title", "reasoning", "visual_prompt", "gift_description", "suggested_gifts"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Santa is speechless. No response received.");
    }

    const verdict: SantaVerdict = JSON.parse(response.text);
    return verdict;

  } catch (error) {
    console.error("Error asking Santa:", error);
    throw error;
  }
};

export const generateToyOrCoal = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing. Please add it in the settings.");
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    // "Nano Banana" - Gemini 2.5 Flash Image
    // Using gemini-2.5-flash-image for speed as requested
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { text: prompt + " photorealistic, high quality, festive lighting, 8k" }
        ]
      },
      config: {
        // Nano Banana does not support aspect ratio config in the standard generateContent text-to-image path 
        // in the same way Imagen does, but usually defaults to 1:1.
      }
    });

    // Extract the image from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("The elves failed to craft the image.");

  } catch (error) {
    console.error("Error in Toy Shop:", error);
    throw error;
  }
};