
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { API_MODEL_TEXT } from '../constants';
import { GroundingChunk, GroundingMetadata, ProductCategory } from "../types";

let ai: GoogleGenAI | null = null;

const getAIInstance = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("Gemini API için API_KEY ortam değişkeni ayarlanmadı.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const createChatSession = (): Chat => {
  const currentAI = getAIInstance();
  return currentAI.chats.create({
    model: API_MODEL_TEXT,
    config: {
      systemInstruction: `Sen dost canlısı ve bilgili bir B2B ürün kataloğu asistanısın.
      Birincil hedefin, kullanıcıların ürünleri bulmasına, ürün özellikleri, fiyatlandırma, stok durumu hakkında soruları yanıtlamasına ve katalogda gezinmelerine yardımcı olmaktır.
      Ayrıca ihtiyaçlarına göre önerilerde bulunabilirsin.
      Güncel olaylar veya güncel bilgi gerektiren konular hakkında soru sorulursa arama yeteneklerini kullan.
      Her zaman profesyonel, öz ve yardımcı ol. Arama yaparsan kaynakları belirt.`,
      tools: [{ googleSearch: {} }], // Google Search'ü etkinleştir
    },
  });
};

export const sendMessageToChatStream = async (
  chat: Chat,
  message: string,
  onChunk: (text: string, isFinal: boolean, groundingMetadata?: GroundingMetadata) => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const result = await chat.sendMessageStream({ message });
    let accumulatedText = "";
    let finalGroundingMetadata: GroundingMetadata | undefined = undefined;

    for await (const chunk of result) {
      const chunkText = chunk.text;
      accumulatedText += chunkText;
      
      if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].groundingMetadata) {
        finalGroundingMetadata = chunk.candidates[0].groundingMetadata as GroundingMetadata;
      }
      onChunk(accumulatedText, false, finalGroundingMetadata); 
    }
    onChunk(accumulatedText, true, finalGroundingMetadata); 
  } catch (error) {
    console.error("Gemini'ye mesaj gönderilirken hata oluştu:", error);
    onError(error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu'));
  }
};


export const parseJsonFromGeminiResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; 
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Gemini'den gelen JSON yanıtı ayrıştırılamadı:", e, "Ham metin:", responseText);
    return null;
  }
};

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  try {
    const currentAI = getAIInstance();
    const prompt = `'${productName}' adlı ve '${category}' kategorisindeki bir B2B ürünü için kısa, çekici ve bilgilendirici bir ürün açıklaması yaz. Maksimum 2 cümle olsun.`;
    const response = await currentAI.models.generateContent({
      model: API_MODEL_TEXT,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("YZ ürün açıklaması oluşturulurken hata:", error);
    return ""; // Hata durumunda boş açıklama
  }
};

export const generateProductImageUrl = async (productName: string, category: string): Promise<string> => {
  try {
    // Basit bir placeholder URL üreteci
    // Gerçek bir YZ resim üretimi için farklı bir API ve süreç gerekir.
    // Bu, sadece bir örnek ve test amaçlıdır.
    const seed = productName.toLowerCase().replace(/\s+/g, '-') + '-' + category.toLowerCase().replace(/\s+/g, '-');
    // Güvenlik için seed'i encode edelim
    const encodedSeed = encodeURIComponent(seed);
    // await new Promise(resolve => setTimeout(resolve, 200)); // Küçük bir gecikme simülasyonu
    return `https://picsum.photos/seed/${encodedSeed}/600/400`;
  } catch (error) {
    console.error("YZ ürün resmi URL'si oluşturulurken hata:", error);
    return `https://picsum.photos/seed/defaultproduct/600/400`; 
  }
};