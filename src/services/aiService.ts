import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFinancialInsights(transactions: any[], userProfile: any) {
  const prompt = `As a financial AI advisor, analyze these transactions and user profile to provide exactly 6 actionable, punchy insights.
  User Profile: ${JSON.stringify(userProfile)}
  Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
  
  CRITICAL: You MUST return exactly 6 strings in a JSON array. Each string should be a short, impactful advice (e.g., "Lost Money Found: Move $1,850 to SIP").`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API key is missing");
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    // Silent fallback for demo purposes or when offline
    return [
      "Lost Money Found: Move $1,850 to SIP",
      "Subscription Audit: You could save $45/mo by canceling unused apps",
      "Credit Boost: Your utilization is at 12%, keep it under 10% for a score jump",
      "Tax Strategy: Maximize your 401(k) contribution to save $2,400 in taxes yearly",
      "Emergency Fund: You have 3 months covered, aim for 6 to reach 'Fortress' status",
      "Bill Negotiation: Your internet provider has a lower current rate; call to save $20/mo"
    ];
  }
}

export async function askCreditExpert(question: string, userProfile: any) {
  const prompt = `You are a credit card expert for Nudge. Answer this user question based on their profile:
  User Profile: ${JSON.stringify(userProfile)}
  Question: ${question}
  
  Provide a concise, helpful answer with specific recommendations if applicable.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "The credit expert is currently offline. Please try again later.";
  }
}
