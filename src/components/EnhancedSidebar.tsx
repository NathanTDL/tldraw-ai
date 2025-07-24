'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from './ui/button';
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

const EnhancedSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
  const [showUpgradeCard, setShowUpgradeCard] = useState(true);
  
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
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
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Canvas Button */}
      {!isCollapsed && (
        <div className="p-4">
          <Button 
            className="w-full justify-center h-11 font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            <Sparkles className="h-3 w-3 mr-1" />
            New Canvas
          </Button>
        </div>
      )}

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
      {!isCollapsed && showUpgradeCard && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02] relative">
            <button 
              onClick={() => setShowUpgradeCard(false)} 
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
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Nathan G.
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                nathan@weplit.ai
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default EnhancedSidebar;
