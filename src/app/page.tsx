"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tldraw } from "@tldraw/tldraw";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import "@tldraw/tldraw/tldraw.css";

export default function Dashboard() {
  /* ---- sidebar + chat state ---- */

  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([{ role: "ai", content: "Hello! How can I help you transform your canvas?" }]);
  const [input, setInput] = useState("");

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
  };

  /* ---- layout ---- */
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <EnhancedSidebar />

      {/* ——— Center: Canvas placeholder ——— */}
      <main className="flex-1 bg-white dark:bg-gray-900 flex items-center justify-center">
        <Tldraw persistenceKey="dashboard" className="w-full h-5/6 mx-auto" />
      </main>

      {/* ——— Right: AI chat ——— */}
      <aside className="w-80 shrink-0 border-l bg-muted/50 flex flex-col">
        <header className="p-4 border-b">
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m, i) => (
            <Card key={i}>
              <CardHeader className="p-2">
                <CardTitle className="text-xs text-muted-foreground">
                  {m.role === "user" ? "You" : "AI"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 text-sm whitespace-pre-wrap">
                {m.content}
              </CardContent>
            </Card>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t space-y-2">
          <Input
            placeholder="Ask the AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button className="w-full" type="submit">
            Send
          </Button>
        </form>
      </aside>
    </div>
  );
}