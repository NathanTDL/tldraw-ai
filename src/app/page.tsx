"use client";

import { useRef, useState, useEffect } from "react";
import { Tldraw, Editor } from "@tldraw/tldraw";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import { useCanvas } from "@/contexts/CanvasProvider";
import AISidebar from "@/components/AISidebar";
import "@tldraw/tldraw/tldraw.css";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Dashboard() {
  const { registerEditor, saveActiveCanvas, isSaving, lastSaved } = useCanvas();
  /* ---- sidebar + chat state ---- */
  const editorRef = useRef<Editor | null>(null);
  const [isAiSidebarCollapsed, setIsAiSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebars on mobile
      if (mobile) {
        setIsAiSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ---- layout ---- */
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border-slate-200 dark:border-slate-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Left Sidebar - Responsive */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative'
        }
      `}>
        <EnhancedSidebar isMobile={isMobile} onMobileClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ——— Center: Canvas placeholder ——— */}
      <main className={`
        relative flex-1 bg-white dark:bg-gray-900 flex items-center justify-center
        ${isMobile ? 'px-2 py-16' : 'px-4 py-4'}
      `}>
        <div className="w-full h-full relative">
          <Tldraw
            persistenceKey="dashboard"
            className="w-full h-full rounded-lg overflow-hidden"
            onMount={(e) => {
              editorRef.current = e;
              registerEditor(e);
            }}
          />
          
          {/* Save status - Responsive positioning */}
          <div className={`
            absolute z-50 flex flex-col gap-2
            ${isMobile 
              ? 'top-2 right-2'
              : 'top-4 right-4'
            }
          `}>
            {/* Save status indicator */}
            {isSaving && (
              <div className={`
                bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-lg
                ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1'}
              `}>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isMobile ? 'Saving...' : 'Auto-saving...'}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ——— Right: AI chat - Responsive ——— */}
      <AISidebar
        isCollapsed={isAiSidebarCollapsed}
        onToggleCollapse={setIsAiSidebarCollapsed}
        isMobile={isMobile}
      />
    </div>
  );
}
