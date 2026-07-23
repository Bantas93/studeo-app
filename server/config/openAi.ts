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
  const now = new Date();
  const time = now.toLocaleString("id-ID", {
    hour12: false,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log(time, "<<<TIME");
  const prompt =
    `Kamu adalah notulen rapat profesional. Rangkum percakapan berikut dalam format notulensi rapat yang STRUKTUR dan KONSISTEN.

⚠️ PENTING: Kamu WAJIB mengikuti template output berikut. JANGAN mengubah struktur, judul section, atau urutan. Hanya isi bagian yang ditandai dengan kurung siku [].

TOPIK RAPAT: ${params.topic}

PERCAKAPAN:
${params.conversation}

---START TEMPLATE OUTPUT (WAJIB DIIKUTI) ---
***NOTULENSI RAPAT***

---

**Topik**: [isi topik]
**Tanggal/Waktu** : [${time}]
**Ringkasan Utama**:

- [poin ringkasan 1] (berupa list)
- [poin ringkasan 2] (berupa list)
- [poin ringkasan 3] (berupa list)

---

**Tindak Lanjut**:

- **Nama Peserta 1**:  (tugas yang harus dikerjakan berupa list)
- **Nama Peserta 2**: (tugas yang harus dikerjakan berupa list)
- **Nama Peserta 3**: (tugas yang harus dikerjakan berupa list)

**Poin Diskusi Penting**:

- [poin diskusi 1] (berupa list)
- [poin diskusi 2] (berupa list)

**Keputusan / Kesimpulan**:
- [keputusan 1] (berupa list)
- [keputusan 2] (berupa list)

---END TEMPLATE OUTPUT (WAJIB DIIKUTI) ---

CATATAN: Jika percakapan TIDAK berkaitan dengan topik "${params.topic}", tetap gunakan template yang sama tetapi tulis "Percakapan tidak berkaitan dengan topik [nama topik]" pada bagian Ringkasan Utama dan tetap rangkum isi percakapan apa adanya.
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
