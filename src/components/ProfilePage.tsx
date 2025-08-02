"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  ChevronLeft,
  Sparkles,
  Key,
  MessageSquare,
  Archive,
  Camera,
  Moon,
  Sun,
  Monitor,
  Lock,
  HelpCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePageProps {
  onClose: () => void;
}

export default function ProfilePage({ onClose }: ProfilePageProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    ai: true,
    updates: true
  });
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveProfile = () => {
    setIsEditing(false);
    // TODO: Update user profile via Supabase
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText("sk-1234567890abcdef");
  };

  if (!user) return null;

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "customization", label: "Customization", icon: Palette },
    { id: "history", label: "History & Sync", icon: Archive },
    { id: "models", label: "Models", icon: Sparkles },
    { id: "api", label: "API Keys", icon: Key },
    { id: "support", label: "Support", icon: MessageSquare }
  ];

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Settings
            </h1>
          </div>
          
          {/* Profile Preview */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {displayName || "No name set"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {activeTab === "account" && (
            <div className="space-y-8">
              {/* Account Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Account Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your account information and preferences.
                </p>
              </div>

              {/* Profile Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Profile Information
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <><X className="w-4 h-4 mr-2" /> Cancel</>
                    ) : (
                      <><Edit3 className="w-4 h-4 mr-2" /> Edit</>
                    )}
                  </Button>
                </div>

                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {displayName.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Display Name
                          </label>
                          <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                            className="max-w-md"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handleSaveProfile}>
                            <Check className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Display Name
                          </label>
                          <p className="text-gray-900 dark:text-gray-100">
                            {displayName || "No name set"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                          </label>
                          <p className="text-gray-900 dark:text-gray-100">{email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Account Type
                          </label>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            Free Plan
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription & Usage */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Subscription & Usage
                </h3>
                
                {/* Current Plan */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">Free Plan</h4>
                      <p className="text-blue-100">Basic features with usage limits</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade
                    </Button>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">15/50</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">35 messages remaining</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Credits</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">8/20</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">12 credits remaining</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Created</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Sign In</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(user.last_sign_in_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                      {user.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "customization" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Customization
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Customize your experience and preferences.
                </p>
              </div>

              {/* Theme Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor }
                  ].map((themeOption) => {
                    const Icon = themeOption.icon;
                    return (
                      <button
                        key={themeOption.id}
                        onClick={() => setTheme(themeOption.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                          theme === themeOption.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{themeOption.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Language
                </h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Notifications
                </h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {key === "ai" ? "AI Suggestions" : 
                           key === "updates" ? "Product Updates" :
                           key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {key === "email" ? "Receive notifications via email" :
                           key === "push" ? "Browser push notifications" :
                           key === "ai" ? "Get AI-powered suggestions" :
                           "Updates about new features"}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  API Keys
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your API keys for external integrations.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Personal API Key
                  </h3>
                  <Button variant="outline" size="sm">
                    Generate New Key
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-sm font-mono text-gray-900 dark:text-gray-100">
                      {showApiKey ? "sk-1234567890abcdef1234567890abcdef" : "sk-••••••••••••••••••••••••••••••••"}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyApiKey}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Keep your API key secure. Don't share it in publicly accessible areas.
                </p>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Support & Help
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Get help and manage your account.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Help Center</span>
                  </div>
                  <p className="text-xs text-gray-500 text-left">
                    Browse our comprehensive help documentation
                  </p>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Contact Support</span>
                  </div>
                  <p className="text-xs text-gray-500 text-left">
                    Get in touch with our support team
                  </p>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Export Data</span>
                  </div>
                  <p className="text-xs text-gray-500 text-left">
                    Download your account data
                  </p>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 border-red-200 text-red-600 hover:bg-red-50">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    <span className="font-medium">Delete Account</span>
                  </div>
                  <p className="text-xs text-red-500 text-left">
                    Permanently delete your account
                  </p>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
