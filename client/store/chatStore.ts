import { create } from "zustand";

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ChatStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
}));