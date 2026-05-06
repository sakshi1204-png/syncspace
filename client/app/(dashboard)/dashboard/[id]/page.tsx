"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Channel {
  id: number;
  name: string;
  description: string;
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.id);
  const { user, logout } = useAuthStore();
  const { messages } = useChatStore();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [newChannel, setNewChannel] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const { sendMessage } = useChat(activeChannel?.id || null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    useAuthStore.getState().loadUser();
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get(
        `/api/channels/workspace/${workspaceId}`);
      setChannels(res.data);
      if (res.data.length > 0) setActiveChannel(res.data[0]);
    } catch {
      toast.error("Failed to load channels");
    }
  };

  const createChannel = async () => {
    if (!newChannel.trim()) return;
    try {
      await api.post("/api/channels", {
        name: newChannel,
        description: "",
        workspaceId
      });
      setNewChannel("");
      fetchChannels();
      toast.success("Channel created!");
    } catch {
      toast.error("Failed to create channel");
    }
  };

  const handleSend = () => {
    if (!messageInput.trim() || !activeChannel) return;
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const currentUser = JSON.parse(stored);
    const userId = currentUser.userId || currentUser.id;
    sendMessage(messageInput, userId);
    setMessageInput("");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-4 border-b border-indigo-700">
          <h1 className="font-bold text-lg cursor-pointer"
              onClick={() => router.push("/dashboard")}>
            ← SyncSpace
          </h1>
          <p className="text-indigo-300 text-xs mt-1">
            {user?.name || "User"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-indigo-400 text-xs font-semibold
              uppercase mb-2">Channels</p>
          {channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className={`px-3 py-2 rounded-lg cursor-pointer
                text-sm mb-1 ${activeChannel?.id === ch.id
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-200 hover:bg-indigo-800"}`}
            >
              # {ch.name}
            </div>
          ))}

          <div className="mt-4">
            <Input
              placeholder="New channel..."
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              className="bg-indigo-800 border-indigo-700
                text-white placeholder:text-indigo-400 text-sm mb-2"
              onKeyDown={(e) => e.key === "Enter" && createChannel()}
            />
            <Button
              onClick={createChannel}
              className="w-full bg-indigo-600 hover:bg-indigo-500
                text-xs py-1"
            >
              + Add Channel
            </Button>
          </div>
        </div>

        <div className="p-3 border-t border-indigo-700">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-xs text-indigo-900 bg-white"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex
            items-center gap-2">
          <span className="text-gray-500 text-lg">#</span>
          <h2 className="font-semibold text-gray-800">
            {activeChannel?.name || "Select a channel"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-4xl mb-2">💬</p>
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100
                    flex items-center justify-center text-indigo-600
                    font-bold text-sm flex-shrink-0">
                  {msg.sender.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-gray-800 text-sm">
                      {msg.sender.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-0.5">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white border-t p-4 flex gap-3">
          <Input
            placeholder={activeChannel
              ? `Message #${activeChannel.name}`
              : "Select a channel first"}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!activeChannel}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!activeChannel}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}