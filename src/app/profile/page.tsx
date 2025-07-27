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
  ArrowLeft,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
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

  // Mock subscription data
  const [subscription] = useState({
    plan: "Free",
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
    setIsEditing(false);
    // TODO: Update user profile via Supabase
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Please sign in to view your profile</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoHome}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Canvas
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Profile Settings
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Profile Section */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start justify-between mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Profile Information
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {displayName.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Display Name"
                      className="text-lg font-medium bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {displayName || "No name set"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {email}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              Subscription & Usage
            </h2>

            {/* Current Plan */}
            <div className={cn(
              "rounded-2xl p-6 mb-6 bg-gradient-to-r text-white shadow-lg",
              getPlanColor(subscription.plan)
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const IconComponent = getPlanIcon(subscription.plan);
                    return <IconComponent className="w-8 h-8" />;
                  })()}
                  <div>
                    <h3 className="text-xl font-bold">{subscription.plan} Plan</h3>
                    <p className="text-sm opacity-90">
                      {subscription.plan === "Free" ? "Limited features" : "Full access"}
                    </p>
                  </div>
                </div>
                {subscription.plan === "Free" && (
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Canvases */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Canvases</span>
                  <Palette className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {subscription.canvases}
                  </span>
                  <span className="text-lg text-slate-500 dark:text-slate-400">
                    / {subscription.maxCanvases}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(subscription.canvases / subscription.maxCanvases) * 100}%` }}
                  />
                </div>
              </div>

              {/* AI Requests */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">AI Requests</span>
                  <Zap className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {subscription.aiRequests}
                  </span>
                  <span className="text-lg text-slate-500 dark:text-slate-400">
                    / {subscription.maxAiRequests}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(subscription.aiRequests / subscription.maxAiRequests) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600"
              >
                <Download className="w-6 h-6 text-blue-500" />
                <div className="text-center">
                  <div className="font-medium">Export Data</div>
                  <div className="text-xs text-slate-500">Download all your canvases</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600"
              >
                <Upload className="w-6 h-6 text-green-500" />
                <div className="text-center">
                  <div className="font-medium">Import Data</div>
                  <div className="text-xs text-slate-500">Restore from backup</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600"
              >
                <Trash2 className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Delete Account</div>
                  <div className="text-xs opacity-75">Permanently remove data</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

