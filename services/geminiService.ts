
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Transcribes audio using the Gemini API.
 * @param base64Audio The base64-encoded audio data.
 * @param mimeType The MIME type of the audio.
 * @returns The transcribed text.
 */
export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
  // Gemini API expects the data part of the base64 string, not the full data URL
  const audioData = base64Audio.split(',')[1];
  
  if (!audioData) {
      throw new Error("Invalid base64 audio data provided.");
  }

  const audioPart = {
    inlineData: {
      data: audioData,
      mimeType: mimeType,
    },
  };

  const textPart = {
      text: "Transcribe the following audio:"
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, audioPart] },
    });

    if (response && response.text) {
        return response.text;
    } else {
        throw new Error("The API response did not contain any text.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Gemini API.");
  }
}
