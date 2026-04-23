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
        <div className="bg-[#1A2520]/95 backdrop-blur-xl border border-gold/20 rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 ease-out">
          <div className="bg-gradient-to-b from-eden to-eden/80 p-5 flex justify-between items-center border-b border-gold/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gold text-base tracking-wide">Eden Concierge</h3>
                <p className="text-[10px] text-gold/60 uppercase tracking-widest flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  Bespoke Service Active
                </p>
              </div>
            </div>
            <button
              className="text-gold/60 hover:text-gold transition-colors p-1"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-[#1A2520]/50 to-transparent scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.isUser
                      ? "bg-gold text-eden rounded-tr-none font-medium"
                      : "bg-[#2A3530] text-gold/90 rounded-tl-none border border-gold/10"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-500">
                <div className="bg-[#2A3530] border border-gold/10 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-5 bg-eden/40 backdrop-blur-md border-t border-gold/10">
            <div className="flex gap-3">
              <Input
                placeholder="Ask your concierge..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                className="bg-eden/50 border-gold/20 text-gold placeholder:text-gold/30 rounded-xl focus-visible:ring-gold/30 h-11"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gold hover:bg-gold-dark text-eden p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:grayscale flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
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
