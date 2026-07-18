import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

export async function askAI(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL_NAME as string,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
}
