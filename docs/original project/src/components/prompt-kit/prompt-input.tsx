"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface PromptInputContextValue {
  value: string;
  onValueChange: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

const PromptInputContext = React.createContext<PromptInputContextValue | undefined>(undefined);

function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput");
  }
  return context;
}

interface PromptInputProps {
  value: string;
  onValueChange: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  className?: string;
  children: React.ReactNode;
}

export function PromptInput({
  value,
  onValueChange,
  isLoading,
  onSubmit,
  className,
  children,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <PromptInputContext.Provider value={{ value, onValueChange, isLoading, onSubmit }}>
      <div className={cn("relative", className)} onKeyDown={handleKeyDown}>
        {children}
      </div>
    </PromptInputContext.Provider>
  );
}

interface PromptInputTextareaProps {
  placeholder?: string;
  className?: string;
}

export function PromptInputTextarea({ placeholder, className }: PromptInputTextareaProps) {
  const { value, onValueChange, isLoading } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      disabled={isLoading}
      className={cn(
        "w-full resize-none border-0 bg-transparent p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 min-h-[44px] max-h-[200px]",
        className
      )}
      rows={1}
    />
  );
}

interface PromptInputActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function PromptInputActions({ children, className }: PromptInputActionsProps) {
  return (
    <div className={cn("flex items-center px-3 pb-3", className)}>
      {children}
    </div>
  );
}

interface PromptInputActionProps {
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export function PromptInputAction({ children, tooltip, className }: PromptInputActionProps) {
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={className}>
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <div className={className}>{children}</div>;
}
