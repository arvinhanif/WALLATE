
import { GoogleGenAI } from "@google/genai";

/**
 * Generate an image using the Gemini API. 
 * This service is designed to be GitHub-friendly. The API key is sourced 
 * from process.env.API_KEY which can be set in GitHub Actions secrets 
 * or hosting provider environment variables.
 */
export async function generateAIImage(prompt: string, aspectRatio: string = "1:1", modelName: string = 'gemini-2.5-flash-image') {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured in your deployment environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("The model did not return any image data. Please try a different prompt.");
    }

    // Find the part containing the image data (base64)
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    
    throw new Error("Image data was not found in the API response.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Provide a user-friendly error message
    throw new Error(error.message || "An unexpected error occurred during image generation.");
  }
}
