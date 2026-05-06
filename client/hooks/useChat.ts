import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useChatStore } from "@/store/chatStore";

const BACKEND_URL = "https://syncspace-production-e965.up.railway.app";

export const useChat = (channelId: number | null) => {
  const clientRef = useRef<Client | null>(null);
  const { addMessage, setMessages, clearMessages } = useChatStore();

  useEffect(() => {
    if (!channelId) return;

    const token = localStorage.getItem("token");

    clearMessages();

    fetch(`${BACKEND_URL}/api/messages/${channelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => console.log("No messages yet"));

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${BACKEND_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log("WebSocket connected!");
        client.subscribe(
          `/topic/channel/${channelId}`,
          (message) => {
            const parsed = JSON.parse(message.body);
            addMessage(parsed);
          }
        );
      },
      onDisconnect: () => console.log("WebSocket disconnected"),
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [channelId]);

  const sendMessage = (content: string, senderId: number) => {
    if (!clientRef.current?.connected || !channelId) return;
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ content, channelId, senderId }),
    });
  };

  return { sendMessage };
};