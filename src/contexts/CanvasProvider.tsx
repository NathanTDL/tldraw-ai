"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { Editor, getSnapshot, loadSnapshot } from "@tldraw/tldraw";
import { supabase } from "@/lib/supabaseClient";

interface CanvasContextValue {
  activeCanvasId: string | null;
  setActiveCanvasId: (id: string | null) => void;
  registerEditor: (editor: Editor) => void;
  saveActiveCanvas: () => Promise<void>;
  loadCanvas: (id: string) => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
  forceSaveCurrentCanvas: () => Promise<void>;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotRef = useRef<string | null>(null);

  const registerEditor = useCallback((editor: Editor) => {
    editorRef.current = editor;
    
    // Set up automatic saving when canvas changes
    const handleStoreChange = () => {
      if (!activeCanvasId || !editorRef.current) return;
      
      // Debounce saving - wait 2 seconds after last change
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        await autoSaveCanvas();
      }, 2000);
    };
    
    // Listen to store changes
    const unsubscribe = editor.store.listen(handleStoreChange, { scope: 'document' });
    
    // Clean up listener when editor changes
    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [activeCanvasId]);

  // Automatic saving function (debounced)
  const autoSaveCanvas = useCallback(async () => {
    if (!activeCanvasId || !editorRef.current || isSaving) return;
    
    try {
      // Get current snapshot
      const snapshot = getSnapshot(editorRef.current.store);
      const json = JSON.stringify(snapshot);
      
      // Check if content has actually changed
      if (lastSnapshotRef.current === json) {
        console.log("Canvas content unchanged, skipping save");
        return;
      }
      
      console.log("Auto-saving canvas...");
      setIsSaving(true);
      
      const { error } = await supabase
        .from("canvases")
        .update({ 
          data: json, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", activeCanvasId);
      
      if (error) {
        console.error("Auto-save error:", error);
      } else {
        lastSnapshotRef.current = json;
        setLastSaved(new Date());
        console.log("Canvas auto-saved successfully");
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [activeCanvasId, isSaving]);
  
  // Manual save function
  const saveActiveCanvas = async () => {
    if (!activeCanvasId || !editorRef.current) {
      console.log("Cannot save: no active canvas or editor");
      return;
    }
    
    try {
      console.log("Manually saving canvas...");
      setIsSaving(true);
      
      // Cancel any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      const snapshot = getSnapshot(editorRef.current.store);
      const json = JSON.stringify(snapshot);
      
      const { error } = await supabase
        .from("canvases")
        .update({ 
          data: json, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", activeCanvasId);
      
      if (error) {
        console.error("Manual save error:", error);
        throw error;
      } else {
        lastSnapshotRef.current = json;
        setLastSaved(new Date());
        console.log("Canvas saved manually");
      }
    } catch (error) {
      console.error("Manual save error:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const loadCanvas = async (id: string) => {
    if (!editorRef.current) {
      console.error("Editor not available for loading canvas");
      return;
    }
    
    console.log(`Loading canvas with ID: ${id}`);
    
    // Clear current canvas content first
    clearCanvasContent();

    try {
      const { data, error } = await supabase
        .from("canvases")
        .select("data")
        .eq("id", id)
        .single();
        
      if (error) {
        console.error("Load canvas error from Supabase:", error);
        // If the canvas doesn't exist, start with empty canvas
        console.log("Canvas doesn't exist, starting with empty canvas");
        return;
      }
      
      console.log("Canvas data from Supabase:", data);
      
      // Check if there's no data column
      if (!data || !data.hasOwnProperty('data')) {
        console.log("No data column found, starting with empty canvas");
        return;
      }
      
      const rawData = data.data;
      console.log("Raw canvas data:", rawData, "Type:", typeof rawData);
      
      // Handle different data formats
      let snapshot;
      
      if (rawData === null || rawData === undefined) {
        console.log("Canvas data is null/undefined, starting with empty canvas");
        return;
      }
      
      if (typeof rawData === 'string') {
        if (rawData.trim() === '' || rawData === 'null' || rawData === 'undefined') {
          console.log("Canvas data is empty string, starting with empty canvas");
          return;
        }
        try {
          snapshot = JSON.parse(rawData);
        } catch (parseError) {
          console.error("Error parsing canvas JSON data:", parseError);
          return;
        }
      } else if (typeof rawData === 'object') {
        // Data is already parsed as object
        snapshot = rawData;
      } else {
        console.error("Unknown data format:", typeof rawData);
        return;
      }
      
      // If we have a valid snapshot, load it
      if (snapshot && typeof snapshot === 'object') {
        console.log("Loading snapshot:", snapshot);
        
        try {
          // Use tldraw's loadSnapshot to restore the canvas
          loadSnapshot(editorRef.current.store, snapshot);
          
          // Update our reference for comparison in auto-save
          lastSnapshotRef.current = JSON.stringify(snapshot);
          
          console.log("✅ Canvas loaded successfully!");
        } catch (loadError) {
          console.error("Error loading snapshot:", loadError);
          console.log("Failed to load canvas, starting with empty canvas");
        }
      } else {
        console.log("No valid snapshot data, starting with empty canvas");
      }
      
    } catch (error) {
      console.error("Error loading canvas:", error);
    }
  };

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

  // Force save current canvas - used when switching between canvases
  const forceSaveCurrentCanvas = async () => {
    if (!activeCanvasId || !editorRef.current) {
      console.log("Cannot force save: no active canvas or editor");
      return;
    }
    
    try {
      console.log("Force saving current canvas before switching...");
      
      // Cancel any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      const snapshot = getSnapshot(editorRef.current.store);
      const json = JSON.stringify(snapshot);
      
      // Save immediately without checking if content changed
      const { error } = await supabase
        .from("canvases")
        .update({ 
          data: json, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", activeCanvasId);
      
      if (error) {
        console.error("Force save error:", error);
      } else {
        lastSnapshotRef.current = json;
        setLastSaved(new Date());
        console.log("Canvas force saved successfully");
      }
    } catch (error) {
      console.error("Force save error:", error);
    }
  };

  const value: CanvasContextValue = {
    activeCanvasId,
    setActiveCanvasId,
    registerEditor,
    saveActiveCanvas,
    loadCanvas,
    isSaving,
    lastSaved,
    forceSaveCurrentCanvas,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider");
  return ctx;
};
