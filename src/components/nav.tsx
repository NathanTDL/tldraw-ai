"use client";

import { useState } from "react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PanelLeft, File, Settings, User } from "lucide-react";
import Image from "next/image";

export function Nav() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`relative min-h-screen border-r flex flex-col items-center p-2 bg-muted/50 transition-all duration-300 ${isCollapsed ? "w-16" : "w-56"}`}>
      <div className="flex h-full max-h-screen flex-col gap-2 items-center">
        <div className="flex items-center justify-center h-16 w-full border-b">
          <Image src="/logowithout.png" alt="Logo" width={32} height={32} />
          {!isCollapsed && <span className="ml-2 font-semibold">Weplit AI</span>}
        </div>
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-1 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <File className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Canvases
              </TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
        <div className="mt-auto flex flex-col items-center gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="mt-auto rounded-lg">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="mt-auto rounded-lg">
                  <User className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Profile
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-muted rounded-full"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <PanelLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} />
      </Button>
    </div>
  );
}
