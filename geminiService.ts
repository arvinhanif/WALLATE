
import { GoogleGenAI } from "@google/genai";

// Generate an image using the Gemini API.
export async function generateAIImage(prompt: string, aspectRatio: string = "1:1", modelName: string = 'gemini-2.5-flash-image') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
      throw new Error("No image generated in the response");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    
    throw new Error("Could not find image data in response parts");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}
