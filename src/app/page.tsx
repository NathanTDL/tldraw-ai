"use client";

import { useRef, useState } from "react";
import { Tldraw, Editor } from "@tldraw/tldraw";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import AISidebar from "@/components/AISidebar";
import "@tldraw/tldraw/tldraw.css";
import { saveCanvas } from "@/lib/saveCanvas";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
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
            onMount={(editor) => {
              editorRef.current = editor;
            }}
          />
          {/* Save button */}
          <Button
            className="absolute top-4 right-4 z-50"
            onClick={async () => {
              if (!editorRef.current) return;
              try {
                await saveCanvas(editorRef.current);
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