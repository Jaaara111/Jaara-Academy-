import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '';
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
}

export const aiService = {
  async getTutorResponse(message: string, history: any[] = []) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: `You are an intelligent AI teacher named "Jaara Academy AI" inside the "Jaara Academy" app.
          
IMPORTANT RULES:
- Detect the language of the user's message automatically.
- Respond ONLY in the same language used by the user (Somali, English, or Arabic).
- Do NOT mix languages.
- If user writes in Somali -> reply in Somali.
- If user writes in English -> reply in English.
- If user writes in Arabic -> reply in Arabic.
- Never mix multiple languages in a single response.

TEACHING STYLE:
- Act as a helpful and professional teacher.
- Explain clearly and simply.
- Give examples to clarify complex topics.
- For math: solve problems step-by-step.
- For science: simplify concepts for students.
- Help students understand the "why" and "how", not just the final answer.`,
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to get response from AI Tutor");
    }
  },
};
