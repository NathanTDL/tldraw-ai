"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { Editor, getSnapshot, loadSnapshot } from "@tldraw/tldraw";
import { supabase } from "@/lib/supabaseClient";

interface CanvasContextValue {
  activeCanvasId: string | null;
  setActiveCanvasId: (id: string | null) => void;
  registerEditor: (editor: Editor) => void;
  saveActiveCanvas: () => Promise<void>;
  loadCanvas: (id: string) => Promise<void>;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const registerEditor = (editor: Editor) => {
    editorRef.current = editor;
  };

  const saveActiveCanvas = async () => {
    if (!activeCanvasId || !editorRef.current) return;
    // Save the full store snapshot (schema + records) so it can be restored accurately
const snapshot = getSnapshot(editorRef.current.store);
    const json = JSON.stringify(snapshot);
    await supabase
      .from("canvases")
      .update({ data: json, updated_at: new Date().toISOString() })
      .eq("id", activeCanvasId);
  };

  const loadCanvas = async (id: string) => {
    if (!editorRef.current) {
      console.error("Editor not available for loading canvas");
      return;
    }
    
    console.log(`Loading canvas with ID: ${id}`);
    
    const clearCanvasContent = () => {
      try {
        // Instead of clearing the entire store, just select all and delete
        editorRef.current?.selectAll();
        editorRef.current?.deleteShapes(editorRef.current.getSelectedShapeIds());
        editorRef.current?.selectNone();
        console.log("Canvas content cleared safely");
      } catch (clearError) {
        console.error("Error clearing canvas content:", clearError);
        // Fallback: try to reset to a minimal state
        try {
          editorRef.current?.selectNone();
        } catch (fallbackError) {
          console.error("Fallback clear also failed:", fallbackError);
        }
      }
    };
    
    try {
      const { data, error } = await supabase
        .from("canvases")
        .select("data")
        .eq("id", id)
        .single();
        
      if (error) {
        console.error("Load canvas error from Supabase:", error);
        // If the canvas doesn't exist, clear the canvas content safely
        clearCanvasContent();
        return;
      }
      
      console.log("Canvas data from Supabase:", data);
      
      // Handle empty or null data by clearing the canvas
      if (!data || data.data === null || data.data === undefined || 
          (typeof data.data === 'object' && Object.keys(data.data).length === 0)) {
        console.log("No canvas data found, creating empty canvas");
        clearCanvasContent();
        return;
      }
      
      const raw = data.data;
      console.log("Raw canvas data:", raw, "Type:", typeof raw);
      
      // Parse the snapshot data
      let snapshot;
      try {
        if (typeof raw === 'string') {
          if (raw.trim() === '' || raw === 'null') {
            console.log("Empty or null string data, clearing canvas");
            clearCanvasContent();
            return;
          }
          snapshot = JSON.parse(raw);
        } else {
          snapshot = raw;
        }
      } catch (parseError) {
        console.error("Error parsing canvas data:", parseError, "Raw data:", raw);
        clearCanvasContent();
        return;
      }
      
      console.log("Parsed snapshot:", snapshot);
      
      // Handle empty snapshot by clearing canvas
      if (!snapshot || (typeof snapshot === 'object' && Object.keys(snapshot).length === 0)) {
        console.log("Empty snapshot after parsing, clearing canvas");
        clearCanvasContent();
        return;
      }

      // Use the modern tldraw API to load the snapshot
      try {
        if (Array.isArray(snapshot)) {
          console.log("Loading legacy array format snapshot - converting to records");
          // For legacy format, just clear and let user start fresh
          console.log("Legacy format detected, clearing canvas for fresh start");
          clearCanvasContent();
        } else if (snapshot && typeof snapshot === 'object') {
          console.log("Loading modern snapshot format");
          // Modern format: use loadSnapshot directly
          loadSnapshot(editorRef.current.store, snapshot);
        } else {
          console.error("Invalid snapshot format:", snapshot, "Type:", typeof snapshot);
          clearCanvasContent();
        }
      } catch (loadError) {
        console.error("Error loading snapshot:", loadError);
        console.log("Failed to load snapshot, clearing canvas");
        clearCanvasContent();
      }
      
      console.log("Canvas loaded successfully");
    } catch (error) {
      console.error("Error loading canvas:", error);
      // Clear canvas on error to prevent corrupted state
      if (editorRef.current) {
        console.log("Clearing canvas due to error");
        clearCanvasContent();
      }
    }
  };

  const value: CanvasContextValue = {
    activeCanvasId,
    setActiveCanvasId,
    registerEditor,
    saveActiveCanvas,
    loadCanvas,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider");
  return ctx;
};
