import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useChatStore } from "@/store/chatStore";

export const useChat = (channelId: number | null) => {
  const clientRef = useRef<Client | null>(null);
  const { addMessage, setMessages, clearMessages } = useChatStore();

  useEffect(() => {
    if (!channelId) return;

    const token = localStorage.getItem("token");

    clearMessages();

    // Load message history
    fetch(`http://localhost:8080/api/messages/${channelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => console.log("No messages yet"));

    // Connect WebSocket
    const client = new Client({
      webSocketFactory: () =>
        new SockJS("http://localhost:8080/ws"),
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
    console.log("Sending message:", content, "senderId:", senderId, "channelId:", channelId);
    console.log("Connected:", clientRef.current?.connected);
    if (!clientRef.current?.connected || !channelId) {
      console.log("Not connected or no channel!");
      return;
    }
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ content, channelId, senderId }),
    });
  };

  return { sendMessage };
};
