import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Welcome to Diz Eden! I'm your AI concierge. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Format messages for the edge function
      // We only send a few recent messages for context to keep it efficient
      const history = messages
        .filter(m => m.id !== "welcome")
        .slice(-5)
        .map(m => ({
          role: m.isUser ? "user" : "assistant",
          content: m.text
        }));
      
      history.push({ role: "user", content: userText });

      const { data, error } = await supabase.functions.invoke("smart-responder", {
        body: { messages: history },
      });

      if (error) throw error;

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "I'm sorry, I'm having trouble thinking right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error connecting to my brain. Please try again or reach out via WhatsApp.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 sm:bottom-[104px] sm:right-8 z-50">
      {isOpen ? (
        <div className="bg-background border border-border rounded-xl shadow-2xl w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Diz Eden Concierge</h3>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  AI Assistant Online
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-background border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-background border border-border p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-background border-t border-border flex gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Input
              placeholder="Ask anything about Diz Eden..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!inputValue.trim() || isLoading}
              className="rounded-full shrink-0 h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="absolute -top-12 right-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            Chat with our AI Concierge
            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-primary rotate-45"></div>
          </div>
          <button
            className="relative flex items-center justify-center rounded-2xl h-14 w-14 sm:h-16 sm:w-16 shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-105 transition-all duration-500 bg-eden border border-gold/30 backdrop-blur-sm group overflow-hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Concierge"
          >
            {/* Shimmering highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Pulsing border effect */}
            <div className="absolute inset-[-2px] rounded-[18px] border border-gold/20 animate-pulse opacity-50 group-hover:opacity-100"></div>

            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold relative z-10 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
};
