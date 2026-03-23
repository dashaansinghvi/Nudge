import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFinancialInsights(transactions: any[], userProfile: any) {
  const prompt = `As a financial AI advisor, analyze these transactions and user profile to provide 3 actionable, punchy insights.
  User Profile: ${JSON.stringify(userProfile)}
  Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
  
  Format: Return a JSON array of 3 strings. Each string should be a short, impactful advice (e.g., "Lost Money Found: Move $1,850 to SIP").`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Insight Error:", error);
    return [
      "Lost Money Found: Move $1,850 to SIP",
      "Subscription Audit: You could save $45/mo by canceling unused apps",
      "Credit Boost: Your utilization is at 12%, keep it under 10% for a score jump"
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
