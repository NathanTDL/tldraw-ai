"use client";

import { useState } from "react";
import { Tldraw } from "@tldraw/tldraw";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import AISidebar from "@/components/AISidebar";
import "@tldraw/tldraw/tldraw.css";

export default function Dashboard() {
  /* ---- sidebar + chat state ---- */
  const [isAiSidebarCollapsed, setIsAiSidebarCollapsed] = useState(false);

  /* ---- layout ---- */
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <EnhancedSidebar />

      {/* ——— Center: Canvas placeholder ——— */}
      <main className="flex-1 bg-white dark:bg-gray-900 flex items-center justify-center">
        <Tldraw persistenceKey="dashboard" className="w-full h-5/6 mx-auto" />
      </main>

      {/* ——— Right: AI chat ——— */}
      <AISidebar
        isCollapsed={isAiSidebarCollapsed}
        onToggleCollapse={setIsAiSidebarCollapsed}
      />
    </div>
  );
}