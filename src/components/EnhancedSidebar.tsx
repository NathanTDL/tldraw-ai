'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from "@/contexts/AuthProvider";
import {
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreVertical,
  Pin,
  Edit3,
  Trash2,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfilePage from './ProfilePage';

const EnhancedSidebar = () => {
  const { user, signOut, openLogin, requireAuth } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
  const [showUpgradeCard, setShowUpgradeCard] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  
  const canvasHistory = {
    Today: [
      { id: '1', name: 'Product Strategy Canvas', isPinned: false },
      { id: '2', name: 'User Journey Map', isPinned: true },
      { id: '3', name: 'Architecture Diagram', isPinned: false },
    ],
    Yesterday: [
      { id: '4', name: 'Mind Map - Features', isPinned: false },
      { id: '5', name: 'Wireframe Sketches', isPinned: true },
    ],
    Older: [
      { id: '6', name: 'Brand Guidelines', isPinned: false },
      { id: '7', name: 'System Flow Chart', isPinned: false },
      { id: '8', name: 'Meeting Notes Visual', isPinned: false },
    ],
  };

  const handleContextMenu = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveContextMenu(activeContextMenu === itemId ? null : itemId);
  };

  const ContextMenu = ({ itemId, onClose }: { itemId: string, onClose: () => void }) => (
    <div className="absolute right-0 top-0 mt-8 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 backdrop-blur-sm">
      <div className="py-2">
        <button className="w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 flex items-center gap-2 transition-all duration-200">
          <Pin className="h-3 w-3 text-blue-500" />
          <span className="font-medium">Pin</span>
        </button>
        <button className="w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 flex items-center gap-2 transition-all duration-200">
          <Edit3 className="h-3 w-3 text-green-500" />
          <span className="font-medium">Rename</span>
        </button>
        <button className="w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 flex items-center gap-2 text-red-600 transition-all duration-200">
          <Trash2 className="h-3 w-3" />
          <span className="font-medium">Delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen border-r bg-sidebar transition-all duration-300 ease-in-out font-sans",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {isCollapsed ? (
        /* Collapsed Layout */
        <>
          {/* Logo */}
          <div className="flex justify-center p-4 border-b border-sidebar-border">
            <div className="relative">
              <Image 
                src="/logowithout.png" 
                alt="Weplit AI Logo" 
                width={28} 
                height={28}
                className="rounded-md"
              />
            </div>
          </div>
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Settings Icon */}
          <div className="flex justify-center p-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Profile Icon */}
          <div className="flex justify-center p-2">
            <div className="relative">
              <div 
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
            </div>
          </div>
          
          {/* Expand Icon */}
          <div className="flex justify-center p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        /* Expanded Layout */
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image 
                  src="/logowithout.png" 
                  alt="Weplit AI Logo" 
                  width={28} 
                  height={28}
                  className="rounded-md"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">
                  Weplit AI
                </h1>
              </div>
            </div>
            
            {/* Collapse Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* New Canvas Button */}
          <div className="p-4">
            <Button 
              className="w-full justify-center h-11 font-semibold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01] border border-slate-700 dark:border-slate-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              New Canvas
            </Button>
          </div>

          {/* Canvas History */}
          <div className="flex-1 overflow-auto px-4">
            {Object.entries(canvasHistory).map(([period, items]) => (
              <div key={period} className="mb-6">
                <h3 className="text-xs font-semibold text-sidebar-foreground/70 tracking-wider mb-3">
                  {period}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="relative group">
                      <Button
                        variant="ghost"
                        className="w-full text-gray-700 justify-start h-9 text-sm font-medium hover:bg-gradient-to-r hover:from-sidebar-accent hover:to-sidebar-accent/50 hover:text-sidebar-accent-foreground pr-8 rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        <span className="flex-1 text-left truncate">{item.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        onClick={(e) => handleContextMenu(item.id, e)}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                      {activeContextMenu === item.id && (
                        <ContextMenu 
                          itemId={item.id} 
                          onClose={() => setActiveContextMenu(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade Card */}
          {showUpgradeCard && (
            <div className="px-4 pb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02] relative">
                <button 
                  onClick={() => {
                    if (!requireAuth()) return;
                    // proceed with create canvas
                  }} 
                  className="absolute top-1 right-1 text-white hover:text-red-400 transition-all duration-200"
                >
                  x
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4" />
                  <span className="font-bold text-sm">Upgrade to Pro</span>
                </div>
                <p className="text-xs opacity-90 mb-2">
                  Unlimited canvases & AI magic ✨
                </p>
                <Button 
                  size="sm" 
                  className="w-full h-7 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-sm border border-white/30 transition-all duration-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}

          {/* Profile Section */}
          <div className="border-t border-sidebar-border p-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative cursor-pointer" onClick={() => window.location.href = '/profile'}>
                  <img
                    src={user.user_metadata?.avatar_url ?? "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => window.location.href = '/profile'}>
                  <p className="text-sm font-medium text-sidebar-foreground truncate hover:text-blue-600 transition-colors">
                    {user.user_metadata?.full_name ?? user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                onClick={openLogin}
              >
                Login
              </Button>
            )}
          </div>
        </>
      )}
      
      {/* Profile Page Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-4/5 max-w-4xl h-4/5 max-h-[90vh] rounded-xl shadow-2xl overflow-hidden">
            <ProfilePage onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
    </aside>
  );
};

export default EnhancedSidebar;
