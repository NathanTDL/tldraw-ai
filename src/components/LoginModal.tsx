"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { X } from "lucide-react";

export const LoginModal = () => {
  const { loginOpen, closeLogin, signInWithGoogle } = useAuth();

  if (!loginOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-[320px] relative shadow-2xl border border-gray-200 dark:border-slate-700">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
          onClick={closeLogin}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-center">Welcome</h2>
        <Button
          onClick={signInWithGoogle}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
};
