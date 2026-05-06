"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Workspace {
  id: number;
  name: string;
  description: string;
  inviteCode: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspace, setNewWorkspace] = useState("");
  const [loading, setLoading] = useState(false);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const stored = localStorage.getItem("user");
    if (stored) {
      useAuthStore.getState().loadUser();
    }
    fetchWorkspaces();
  }, []);
  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/api/workspaces");
      setWorkspaces(res.data);
    } catch (err) {
      toast.error("Failed to load workspaces");
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspace.trim()) {
      toast.error("Enter a workspace name");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/workspaces", {
        name: newWorkspace,
        description: ""
      });
      toast.success("Workspace created!");
      setNewWorkspace("");
      fetchWorkspaces();
    } catch (err) {
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-indigo-600 text-white px-6 py-4 flex
          justify-between items-center">
        <h1 className="text-xl font-bold">SyncSpace</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Hello, {user?.name || "User"} 👋
          </span>
          <Button
            variant="outline"
            className="text-indigo-600 bg-white
              hover:bg-gray-100 text-sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Your Workspaces
        </h2>

        {/* Create Workspace */}
        <div className="flex gap-3 mb-8">
          <Input
            placeholder="New workspace name..."
            value={newWorkspace}
            onChange={(e) => setNewWorkspace(e.target.value)}
            className="max-w-sm"
          />
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={createWorkspace}
            disabled={loading}
          >
            {loading ? "Creating..." : "+ Create"}
          </Button>
        </div>

        {/* Workspace List */}
        {workspaces.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-lg">No workspaces yet</p>
            <p className="text-sm">Create your first workspace above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="bg-white rounded-xl border border-gray-200
                  p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/dashboard/${ws.id}`)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100
                    flex items-center justify-center text-indigo-600
                    font-bold text-lg">
                    {ws.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Code: {ws.inviteCode}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {ws.description || "No description"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}