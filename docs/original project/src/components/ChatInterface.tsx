"use client";

import { useState, useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { ToolCard } from "./ToolCard";
import { Bot, ArrowUp, Square, User, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./prompt-kit/prompt-input";

interface ChatInterfaceProps {
  onViewDetails: (tool: Doc<"tools">) => void;
}

export function ChatInterface({ onViewDetails }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sendMessage = useAction(api.chat.sendMessage);
  const chatHistory = useQuery(api.chat.getChatHistory, { sessionId });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Scroll to top when component mounts
  useEffect(() => {
    scrollToTop();
  }, []);

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
    "Find me design tools for creating logos",
    "What are the best productivity apps for teams?",
    "Show me AI-powered writing assistants",
    "I need tools for social media management"
  ];

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {!chatHistory || chatHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-6 max-w-4xl mx-auto"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">AI Tool Assistant</h3>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">Ask me about tools for design, productivity, development, and more.</p>
              
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
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {chatHistory.map((chat, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 mb-6"
                >
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="flex items-end space-x-2 max-w-[85%] md:max-w-[80%]">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md text-sm md:text-base">
                        {chat.message}
                      </div>
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2 max-w-[85%] md:max-w-[80%]">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md text-sm md:text-base">
                        {chat.response}
                      </div>
                    </div>
                  </div>

                  {/* Tool Recommendations */}
                  {chat.recommendedTools && chat.recommendedTools.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="ml-10 space-y-3"
                    >
                      <p className="text-sm text-muted-foreground font-medium">Recommended tools:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {chat.recommendedTools.map((tool) => (
                          <ToolCard key={tool._id} tool={tool} onViewDetails={onViewDetails} />
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
              className="flex justify-start max-w-4xl mx-auto"
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

      {/* Input */}
      <div className="p-4 md:p-6 border-t bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="border rounded-xl bg-background shadow-sm">
            <PromptInput
              value={message}
              onValueChange={handleValueChange}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              className="w-full"
            >
              <PromptInputTextarea placeholder="Ask about digital tools..." />
              <PromptInputActions className="justify-end">
                <PromptInputAction
                  tooltip={isLoading ? "Stop generation" : "Send message"}
                >
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    disabled={!message.trim() && !isLoading}
                  >
                    {isLoading ? (
                      <Square className="w-4 h-4 fill-current" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}
