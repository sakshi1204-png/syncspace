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

interface Member {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  role: string;
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const { sendMessage } = useChat(activeChannel?.id || null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    useAuthStore.getState().loadUser();
    fetchChannels();
    fetchMembers();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get(`/api/channels/workspace/${workspaceId}`);
      setChannels(res.data);
      if (res.data.length > 0) setActiveChannel(res.data[0]);
    } catch {
      toast.error("Failed to load channels");
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/api/workspaces/${workspaceId}/members`);
      setMembers(res.data);
    } catch {
      console.log("Could not load members");
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

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Enter an email address");
      return;
    }
    setInviteLoading(true);
    try {
      await api.post(`/api/workspaces/${workspaceId}/invite`, {
        email: inviteEmail
      });
      toast.success(`${inviteEmail} invited successfully!`);
      setInviteEmail("");
      setShowInviteModal(false);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSend = () => {
    if (!messageInput.trim() || !activeChannel) return;
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
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
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center
            justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md
              shadow-xl mx-4">
            <h3 className="font-bold text-lg text-gray-800 mb-1">
              Invite Member
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              They must already have a SyncSpace account
            </p>
            <Input
              placeholder="Enter email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleInvite}
                disabled={inviteLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {inviteLoading ? "Inviting..." : "Send Invite"}
              </Button>
              <Button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
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
          {/* Members Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-indigo-400 text-xs font-semibold uppercase">
                Members ({members.length})
              </p>
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="text-indigo-400 text-xs hover:text-white"
              >
                {showMembers ? "hide" : "show"}
              </button>
            </div>
            {showMembers && (
              <div className="mb-2">
                {members.map((m) => (
                  <div key={m.id}
                    className="flex items-center gap-2 px-2 py-1 rounded">
                    <div className="w-6 h-6 rounded-full bg-indigo-500
                        flex items-center justify-center text-xs font-bold">
                      {m.user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-white">{m.user.name}</p>
                      <p className="text-xs text-indigo-400">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={() => setShowInviteModal(true)}
              className="w-full bg-indigo-700 hover:bg-indigo-600
                text-xs py-1"
            >
              + Invite Member
            </Button>
          </div>

          {/* Channels Section */}
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex
            items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-lg">#</span>
            <h2 className="font-semibold text-gray-800">
              {activeChannel?.name || "Select a channel"}
            </h2>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
          >
            + Invite
          </Button>
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