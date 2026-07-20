import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

type AskAIParams = {
  conversation: string;
  topic: string;
};

export async function askAI(params: AskAIParams) {
  const prompt = `Rangkum percakapan berikut ini.
      Hubungkan dengan topik: ${params.topic}.
      respon berupa notulency rapat berformat text.
      Jika percakapan keluar dari topik maka rangkum percakapan tersebut tanpa dihubungkan ke topik.
      
      Percakapan: 
      ${params.conversation}
      `.trim();

  console.log("Prompt:", prompt);

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
