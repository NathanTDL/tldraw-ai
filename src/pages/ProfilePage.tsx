import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { 
  User,
  LogOut,
  Mail
} from "lucide-react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    // Redirect to home page or login
  };

  if (!user) return null;

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 flex flex-col items-center p-6">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
      <div className="w-full max-w-2xl mt-6 bg-gray-100 dark:bg-slate-800 p-6 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <User className="w-16 h-16 text-gray-600 dark:text-gray-300" />
          <div className="flex-1">
            <div className="font-medium text-xl text-gray-900 dark:text-gray-100">
              {displayName || "No name set"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <Mail className="inline w-4 h-4 mr-1" />
              {email}
            </div>
          </div>
        </div>
        <Button variant="ghost" className="mt-4" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
        {isEditing && (
          <div className="mt-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
              placeholder="Display Name"
            />
            <Button className="mt-2" onClick={() => setIsEditing(false)}>
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

