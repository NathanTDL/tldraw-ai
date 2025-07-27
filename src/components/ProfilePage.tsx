"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Settings, 
  Crown, 
  LogOut, 
  Mail, 
  Calendar, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Zap,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePageProps {
  onClose: () => void;
}

export default function ProfilePage({ onClose }: ProfilePageProps) {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    ai: true,
    collaboration: true
  });
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");

  // Mock subscription data based on PRD
  const [subscription] = useState({
    plan: "Free", // Free, Pro, Team, Enterprise
    canvases: 2,
    maxCanvases: 3,
    aiRequests: 45,
    maxAiRequests: 50,
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    features: {
      unlimitedCanvases: false,
      advancedAI: false,
      teamCollaboration: false,
      exportFormats: ["PNG", "SVG"],
      storage: "5GB"
    }
  });

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveProfile = () => {
    // Implementation for saving profile changes
    setIsEditing(false);
    // TODO: Update user profile via Supabase
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Pro": return "from-blue-500 to-purple-500";
      case "Team": return "from-green-500 to-emerald-500";
      case "Enterprise": return "from-orange-500 to-red-500";
      default: return "from-slate-500 to-slate-600";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "Pro": return Crown;
      case "Team": return Shield;
      case "Enterprise": return Zap;
      default: return User;
    }
  };

  if (!user) return null;

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Profile Settings
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-600"
                />
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-6 h-6 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Upload className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Display Name"
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {displayName || "No name set"}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5" />
            Subscription & Usage
          </h2>

          {/* Current Plan */}
          <div className={cn(
            "rounded-lg p-4 mb-4 bg-gradient-to-r text-white",
            getPlanColor(subscription.plan)
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComponent = getPlanIcon(subscription.plan);
                  return <IconComponent className="w-6 h-6" />;
                })()}
                <div>
                  <h3 className="font-semibold">{subscription.plan} Plan</h3>
                  <p className="text-sm opacity-90">
                    {subscription.plan === "Free" ? "Limited features" : "Full access"}
                  </p>
                </div>
              </div>
              {subscription.plan === "Free" && (
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Canvases</span>
                <Palette className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {subscription.canvases}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  / {subscription.maxCanvases}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(subscription.canvases / subscription.maxCanvases) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">AI Requests</span>
                <Zap className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {subscription.aiRequests}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  / {subscription.maxAiRequests}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(subscription.aiRequests / subscription.maxAiRequests) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Plan Features</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {subscription.features.unlimitedCanvases ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span>Unlimited Canvases</span>
              </div>
              <div className="flex items-center gap-2">
                {subscription.features.advancedAI ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span>Advanced AI Models</span>
              </div>
              <div className="flex items-center gap-2">
                {subscription.features.teamCollaboration ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span>Team Collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{subscription.features.storage} Storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5" />
            Preferences
          </h2>

          <div className="space-y-6">
            {/* Notifications */}
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {key === "ai" ? "AI Suggestions" : key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      className={cn(
                        "w-12 h-6 rounded-full p-0 transition-all duration-200",
                        value ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200",
                        value ? "translate-x-6" : "translate-x-0"
                      )} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Theme
              </h3>
              <div className="flex gap-2">
                {["Light", "Dark", "System"].map((themeOption) => (
                  <Button
                    key={themeOption}
                    variant={theme === themeOption.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(themeOption.toLowerCase())}
                    className="flex-1"
                  >
                    {themeOption}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
            <Download className="w-5 h-5" />
            Data Management
          </h2>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Canvas Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Canvas Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            Account Information
          </h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Account Created:</span>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Sign In:</span>
              <span>{new Date(user.last_sign_in_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
