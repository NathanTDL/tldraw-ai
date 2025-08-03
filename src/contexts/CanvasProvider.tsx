"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { Editor, getSnapshot, loadSnapshot } from "@tldraw/tldraw";
import { supabase } from "@/lib/supabaseClient";

interface CanvasContextValue {
  activeCanvasId: string | null;
  setActiveCanvasId: (id: string | null) => void;
  registerEditor: (editor: Editor) => void;
  saveActiveCanvas: () => Promise<void>;
  forceSaveCurrentCanvas: (forceEvenIfUnchanged?: boolean) => Promise<void>;
  saveCanvasById: (canvasId: string, forceEvenIfUnchanged?: boolean) => Promise<void>;
  loadCanvas: (id: string) => Promise<void>;
  createNewCanvas: () => Promise<string | null>;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  editorRef: React.MutableRefObject<Editor | null>;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotRef = useRef<string | null>(null);
  
  // Generate a proper UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // localStorage helpers
  const saveLastCanvasId = (canvasId: string) => {
    try {
      localStorage.setItem('tldrawai-last-canvas-id', canvasId);
      console.log('💾 Saved last canvas ID to localStorage:', canvasId);
    } catch (error) {
      console.error('Error saving last canvas ID:', error);
    }
  };
  
  const getLastCanvasId = (): string | null => {
    try {
      const lastCanvasId = localStorage.getItem('tldrawai-last-canvas-id');
      console.log('📂 Retrieved last canvas ID from localStorage:', lastCanvasId);
      return lastCanvasId;
    } catch (error) {
      console.error('Error retrieving last canvas ID:', error);
      return null;
    }
  };
  
  // Enhanced setActiveCanvasId that persists to localStorage
  const setActiveCanvasIdWithPersistence = useCallback((id: string | null) => {
    setActiveCanvasId(id);
    if (id) {
      saveLastCanvasId(id);
    }
  }, []);

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

  const loadCanvas = async (id: string) => {
    if (!editorRef.current) {
      console.error("Editor not available for loading canvas");
      return;
    }
    
    console.log(`Loading canvas with ID: ${id}`);
    setIsLoading(true);
    
    try {
      // Clear current canvas content first
      clearCanvasContent();
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
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new canvas (only when explicitly requested)
  const createNewCanvas = useCallback(async (): Promise<string | null> => {
    try {
      console.log('🎨 Creating new canvas...');
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user, creating temporary canvas ID');
        // Create a temporary canvas ID for local use
        const tempCanvasId = generateUUID();
        console.log('✅ Created temporary canvas ID:', tempCanvasId);
        return tempCanvasId;
      }
      
      // Generate a proper UUID for the canvas
      const canvasId = generateUUID();
      
      // Generate a title with current date/time
      const now = new Date();
      const title = now.toLocaleString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      // Create an empty canvas in the database with all required fields
      const { data, error } = await supabase
        .from('canvases')
        .insert({
          id: canvasId,
          user_id: user.id,
          title: title,
          data: {}, // Empty canvas data as object
          is_pinned: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating new canvas:', error);
        // Fallback to local canvas ID
        const tempCanvasId = generateUUID();
        console.log('✅ Created temporary canvas ID due to DB error:', tempCanvasId);
        return tempCanvasId;
      }
      
      console.log('✅ New canvas created with ID:', canvasId);
      
      // Clear the current canvas content to show empty state
      if (editorRef.current) {
        clearCanvasContent();
      }
      
      return canvasId;
      
    } catch (error) {
      console.error('Error in createNewCanvas:', error);
      // Fallback to local canvas ID
      const tempCanvasId = generateUUID();
      console.log('✅ Created temporary canvas ID due to error:', tempCanvasId);
      return tempCanvasId;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize with last opened canvas on app startup
  const initializeCanvas = useCallback(async () => {
    if (isInitialized || !editorRef.current) return;
    
    console.log('🚀 Initializing canvas provider...');
    setIsLoading(true);
    
    try {
      // Get last opened canvas from localStorage
      const lastCanvasId = getLastCanvasId();
    
    if (lastCanvasId) {
      console.log('📖 Attempting to restore last canvas:', lastCanvasId);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Verify canvas exists in database
        const { data, error } = await supabase
          .from('canvases')
          .select('id')
          .eq('id', lastCanvasId)
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          console.log('✅ Last canvas found in database, loading...');
          setActiveCanvasIdWithPersistence(lastCanvasId);
          await loadCanvas(lastCanvasId);
          return; // Success, exit early
        } else {
          console.log('❌ Last canvas not found or not accessible, creating new one');
        }
      } else {
        console.log('👤 No authenticated user, will create temporary canvas');
      }
    }
    
      // Fallback: create a new canvas if no last canvas or it doesn't exist
      console.log('📝 Creating new canvas as fallback...');
      const newCanvasId = await createNewCanvas();
      if (newCanvasId) {
        setActiveCanvasIdWithPersistence(newCanvasId);
      }
    } catch (error) {
      console.error('Error during canvas initialization:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isInitialized, createNewCanvas, setActiveCanvasIdWithPersistence]);
  
  useEffect(() => {
    // Only initialize when editor is available
    if (editorRef.current && !isInitialized) {
      initializeCanvas();
    }
  }, [editorRef.current, isInitialized, initializeCanvas]);

  const registerEditor = useCallback((editor: Editor) => {
    editorRef.current = editor;
    console.log('✅ Canvas editor registered');
  }, []);

  // Force save function (used for both auto-save and canvas switching)
  const forceSaveCurrentCanvas = useCallback(async (forceEvenIfUnchanged = false) => {
    if (!activeCanvasId || !editorRef.current) {
      console.log("Cannot force save: no active canvas or editor");
      return;
    }
    
    // Skip if already saving to prevent concurrent saves
    if (isSaving) {
      console.log("Save already in progress, skipping");
      return;
    }
    
    try {
      // Cancel any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      const snapshot = getSnapshot(editorRef.current.store);
      const json = JSON.stringify(snapshot);
      
      // Check if content has actually changed (unless forcing)
      if (!forceEvenIfUnchanged && lastSnapshotRef.current === json) {
        console.log("Canvas content unchanged, skipping save");
        return;
      }
      
      // Check if user is authenticated before saving
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user, skipping force save");
        // Still update local reference to avoid repeated attempts
        lastSnapshotRef.current = json;
        return;
      }
      
      console.log(forceEvenIfUnchanged ? "Force saving canvas for switch..." : "Auto-saving canvas changes...");
      setIsSaving(true);
      
      const { error } = await supabase
        .from("canvases")
        .update({ 
          data: snapshot // Save as object, not string
        })
        .eq("id", activeCanvasId);
      
      if (error) {
        console.error("Force save error:", error);
        throw error;
      } else {
        lastSnapshotRef.current = json;
        setLastSaved(new Date());
        console.log("Canvas saved successfully");
      }
    } catch (error) {
      console.error("Force save error:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [activeCanvasId, isSaving]);

  // Set up auto-save when canvas is ready
  useEffect(() => {
    if (!editorRef.current || !activeCanvasId || !isInitialized) {
      return; // Wait until everything is ready
    }
    
    console.log('🎯 Setting up auto-save for canvas:', activeCanvasId);
    
    // Set up automatic saving when canvas changes
    const handleStoreChange = (entry: any) => {
      if (!editorRef.current || !activeCanvasId || !isInitialized) {
        return;
      }
      
      // Only trigger on meaningful changes (not hover, selection, etc.)
      if (entry.changes) {
        const hasShapeChanges = Object.keys(entry.changes.added).some(key => key.startsWith('shape:')) ||
                               Object.keys(entry.changes.updated).some(key => key.startsWith('shape:')) ||
                               Object.keys(entry.changes.removed).some(key => key.startsWith('shape:'));
        
        if (!hasShapeChanges) {
          return; // Skip non-shape changes like viewport, selection, etc.
        }
      }
      
      console.log('🎯 Canvas content changed, scheduling auto-save...');
      
      // 300ms debounce for very responsive saving
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        await forceSaveCurrentCanvas();
      }, 300); // 300ms debounce using forceSave
    };
    
    // Listen to document changes only (shapes, arrows, text, etc.)
    const unsubscribe = editorRef.current.store.listen(handleStoreChange, {
      scope: 'document'
    });
    
    console.log('✅ Auto-save listener set up with 300ms debounce');
    
    // Clean up listener when dependencies change
    return () => {
      console.log('🧹 Cleaning up auto-save listener');
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [editorRef.current, activeCanvasId, isInitialized, forceSaveCurrentCanvas]);

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
      
      // Check if user is authenticated before saving
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user, skipping auto-save");
        // Still update local reference to avoid repeated attempts
        lastSnapshotRef.current = json;
        return;
      }
      
      console.log("Auto-saving canvas...");
      setIsSaving(true);
      
      const { error } = await supabase
        .from("canvases")
        .update({ 
          data: snapshot // Save as object, not string
        })
        .eq("id", activeCanvasId);
      
      if (error) {
        console.error("Auto-save error:", error);
        // Don't update lastSnapshotRef on error so it will retry
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
          data: snapshot // Save as object, not string
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



  const value: CanvasContextValue = {
    activeCanvasId,
    setActiveCanvasId: setActiveCanvasIdWithPersistence,
    registerEditor,
    saveActiveCanvas,
forceSaveCurrentCanvas,
    saveCanvasById: forceSaveCurrentCanvas,
    loadCanvas,
    createNewCanvas,
    isSaving,
    isLoading,
    lastSaved,
    editorRef,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider");
  return ctx;
};
