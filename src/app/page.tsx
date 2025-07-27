"use client";

import { useRef, useState } from "react";
import { Tldraw, Editor } from "@tldraw/tldraw";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import { useCanvas } from "@/contexts/CanvasProvider";
import AISidebar from "@/components/AISidebar";
import "@tldraw/tldraw/tldraw.css";

import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { registerEditor, saveActiveCanvas } = useCanvas();
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
          {/* Save button */}
          <Button
            className="absolute top-4 right-4 z-50"
            onClick={async () => {
              if (!editorRef.current) return;
              try {
                await saveActiveCanvas();
                alert("Canvas saved to Supabase ✔️");
              } catch (err) {
                console.error(err);
                alert("Failed to save canvas ❌");
              }
            }}
          >
            Save
          </Button>
      </main>

      {/* ——— Right: AI chat ——— */}
      <AISidebar
        isCollapsed={isAiSidebarCollapsed}
        onToggleCollapse={setIsAiSidebarCollapsed}
      />
    </div>
  );
}