
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ValidationResult {
  isValid: boolean;
  category: string;
  reason: string;
}

export async function validateCivicIssue(imageBase64: string, description: string): Promise<ValidationResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64.split(",")[1] || imageBase64,
              },
            },
            {
              text: `Analyze this image and the following description: "${description}". 
              Is this a genuine civic issue related to public infrastructure (road, water, electricity, waste, footpath, public park, etc.)?
              Return the answer in JSON format with "isValid" (boolean), "category" (string), and "reason" (string).
              Strictly reject selfies, random objects, indoor house photos, or unrelated content.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            category: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["isValid", "category", "reason"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("AI Validation Error:", error);
    // Fallback if AI fails
    return { isValid: true, category: "Unknown", reason: "Analysis bypassed due to server error." };
  }
}
