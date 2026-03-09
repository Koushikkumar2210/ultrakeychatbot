
import { GoogleGenAI, GenerateContentResponse, Chat, Content } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;
  private history: Content[] = [];
  private knowledgeBase: string = "";

  private companySecrets = {
    address: "Flat No: 204, 2nd Floor, Cyber Residency, above Indian Bank, Indira Nagar, Gachibowli, Hyderabad, Telangana 500032.",
    landmark: "Above Indian Bank, Gachibowli",
    phone: "+91 91234 56789",
    email: "info@ultrakey.in",
    hours: "10 AM to 6:30 PM (Mon-Sat)",
    services: [
      "Web Core: High-performance Web Development (React, Next.js, Node.js, etc.)",
      "Digital Ops: Comprehensive Digital Marketing strategies",
      "Brand Design: Professional Graphic Design and UI/UX systems",
      "SEO Engine: Search Engine Optimization to dominate search results",
      "Social Hub: Social Media Optimization (SMO) and management",
      "Ad Systems: Strategic Google Ads (PPC) campaigns",
      "Accountancy: Expert Chartered Accountant (CA) services for businesses",
      "Mobile Apps: Cutting-edge Mobile App Development (iOS & Android)"
    ]
  };

  private constructor() {
    this.knowledgeBase = localStorage.getItem('ultrakey_knowledge') || "";
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public setKnowledge(knowledge: string) {
    this.knowledgeBase = knowledge;
    localStorage.setItem('ultrakey_knowledge', knowledge);
  }

  private async getCurrentPosition(): Promise<{ latitude: number, longitude: number } | null> {
    if (!navigator.geolocation) return null;
    try {
      return await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 5000 }
        );
      });
    } catch {
      return null;
    }
  }

  public async *sendMessageStream(message: string, imageBase64?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const location = await this.getCurrentPosition();
    
    const knowledgeInstruction = this.knowledgeBase 
      ? `\n\nKNOWLEDGE BASE CONTEXT:\n${this.knowledgeBase}`
      : "";

    const systemPrompt = `
You are the professional digital assistant for "UltraKey IT Solutions".

SERVICES PROVIDED BY ULTRAKEY:
${this.companySecrets.services.map(s => `- ${s}`).join('\n')}

STRICT BEHAVIORAL PROTOCOL:
1. LEAD GENERATION: If the user asks about ANY service, politely insist on getting their Email Address and Mobile Number.
2. CONTACT CAPTURE: Once the user provides their details (Email and Phone), IMMEDIATELY output a confirmation block at the end of your response in exactly this format:

--- 
**SYSTEM NOTIFICATION:** 📧 
Lead confirmed for USER_EMAIL. Digital proposal dispatched.

Replace USER_EMAIL with the actual email provided. Do NOT bold the email itself inside this specific block, just write it as plain text. This block triggers the internal lead management system UI.
3. CONVERSATION CONTINUITY: After lead capture, focus on helpful technical/business info about UltraKey.
4. LOCATION: Only share the UltraKey IT Solutions address. Do NOT mention or list any other nearby businesses or locations.
5. BRANDING: You are "UltraKey IT Solutions". Use a polished, modern corporate tone.

COMPANY INFO:
- Address: ${this.companySecrets.address}
- Landmark: ${this.companySecrets.landmark}
- Phone: ${this.companySecrets.phone}
- Email: ${this.companySecrets.email}

${knowledgeInstruction}
    `;

    const chat: Chat = ai.chats.create({
      model: 'gemini-3.1-pro-preview',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        tools: [
          { googleSearch: {} }
        ]
      },
      history: this.history,
    });

    try {
      const parts: any[] = [{ text: message }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: imageBase64.split(',')[1] || imageBase64
          }
        });
      }

      const streamResponse = await chat.sendMessageStream({ message: parts });
      let fullResponseText = "";
      
      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        
        if (c.candidates?.[0]?.groundingMetadata) {
          yield { type: 'grounding', data: c.candidates[0].groundingMetadata };
        }

        const text = c.text || "";
        if (text) {
          fullResponseText += text;
          yield { type: 'text', data: text };
        }
      }

      this.history.push({ role: 'user', parts });
      this.history.push({ role: 'model', parts: [{ text: fullResponseText }] });
    } catch (error: any) {
      console.error("Gemini Core Error:", error);
      const msg = error?.message || "";
      if (msg.includes("Requested entity was not found") || msg.includes("401") || msg.includes("403")) {
        throw new Error("AUTH_REQUIRED");
      }
      throw error;
    }
  }

  public resetChat() {
    this.history = [];
  }
}
