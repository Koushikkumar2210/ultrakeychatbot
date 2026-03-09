
export enum Role {
  USER = 'user',
  BOT = 'bot'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  groundingMetadata?: any;
  image?: string; // base64 string
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  knowledgeBase: string;
}
