"use client";

import { useRef, useState } from "react";
import { Tldraw, Editor } from "@tldraw/tldraw";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import { useCanvas } from "@/contexts/CanvasProvider";
import AISidebar from "@/components/AISidebar";
import "@tldraw/tldraw/tldraw.css";

import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { registerEditor, saveActiveCanvas, isSaving, lastSaved } = useCanvas();
  /* ---- sidebar + chat state ---- */
  const editorRef = useRef<Editor | null>(null);
  const [isAiSidebarCollapsed, setIsAiSidebarCollapsed] = useState(false);

  /* ---- layout ---- */
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <EnhancedSidebar />

      {/* ——— Center: Canvas placeholder ——— */}
      <main className="relative flex-1 bg-white dark:bg-gray-900 flex items-center justify-center">
        <Tldraw
            persistenceKey="dashboard"
            className="w-full h-5/6 mx-auto"
            onMount={(e) => {
              editorRef.current = e;
              registerEditor(e);
            }}
          />
          {/* Save status and button */}
          <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
            {/* Save status indicator */}
            {isSaving && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Auto-saving...
              </div>
            )}
            
          </div>
      </main>

      {/* ——— Right: AI chat ——— */}
      <AISidebar
        isCollapsed={isAiSidebarCollapsed}
        onToggleCollapse={setIsAiSidebarCollapsed}
      />
    </div>
  );
}