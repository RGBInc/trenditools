"use client";

import { useState, useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { ToolCard } from "./ToolCard";
import { Bot, ArrowUp, Square, User, Wrench } from "lucide-react";
import { Button } from "./ui/button";
import { ViewToggle } from "./ViewToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./prompt-kit/prompt-input";

interface ChatInterfaceProps {
  onViewToolPage: (tool: Doc<"tools">) => void;
}

export function ChatInterface({ onViewToolPage }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sendMessage = useAction(api.chat.sendMessage);
  const chatHistory = useQuery(api.chat.getChatHistory, { sessionId });

  const getGridCols = () => {
    switch (viewMode) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 lg:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not on mount
    if (chatHistory && chatHistory.length > 0) {
      scrollToBottom();
    }
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      await sendMessage({
        message: userMessage,
        sessionId,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    setMessage(value);
  };

  const suggestedQueries = [
    "Find design tools for creating logos",
    "What are the best project management apps?",
    "Show AI-powered writing assistants",
    "Need tools for social media management"
  ];

  return (
    <div className="flex flex-col h-full pb-32">
      {/* Chat History */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {!chatHistory || chatHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-6"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">TrendiTools Assistant</h3>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">Ask about tools for design, productivity, development, and more.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQueries.map((query, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setMessage(query)}
                    className="p-3 text-sm text-left bg-muted hover:bg-accent rounded-lg transition-colors"
                  >
                    {query}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div>
            <AnimatePresence>
              {chatHistory.map((chat, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 mb-6"
                >
                  {/* Query Display */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Your query:</span>
                    </div>
                    <div className="bg-muted/50 px-4 py-3 rounded-lg border-l-4 border-primary/30">
                      <p className="text-sm md:text-base">{chat.message}</p>
                    </div>
                  </div>

                  {/* Tool Recommendations */}
                  {chat.recommendedTools && chat.recommendedTools.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">Recommended tools:</p>
                        </div>
                        <div className="hidden md:block">
                          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>
                      </div>
                      <div className={`grid ${getGridCols()} gap-4 md:gap-6`}>
                        {chat.recommendedTools.map((tool) => (
                          <ToolCard key={tool._id} tool={tool} onViewToolPage={onViewToolPage} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm md:text-base">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Section with better UI */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 md:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-primary/20 rounded-2xl bg-gradient-to-r from-background to-background/80 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-primary/30 focus-within:border-primary/50">
            <PromptInput
              value={message}
              onValueChange={handleValueChange}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              className="p-1"
            >
              <div className="flex items-start space-x-3 p-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <PromptInputTextarea 
                    placeholder="Ask about digital tools, productivity apps, or anything tech-related..."
                    className="min-h-[60px] text-base leading-relaxed resize-none border-0 bg-transparent p-0 focus:ring-0 placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
              <PromptInputActions className="px-4 pb-4 pt-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!message.trim() || isLoading}
                    onClick={handleSubmit}
                    className="h-9 w-9 p-0 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isLoading ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </PromptInputActions>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}
