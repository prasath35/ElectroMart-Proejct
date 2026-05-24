import React, { useState, useRef, useEffect } from "react";
import { 
  Fab, 
  Paper, 
  Typography, 
  Box, 
  IconButton, 
  InputBase, 
  Avatar, 
  Button, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  PhoneCall, 
  HelpCircle, 
  HelpCircleIcon
} from "lucide-react";

interface AIWidgetProps {
  currentRole: string;
  onNavigateToProduct?: (id: string) => void;
}

export default function AIWidget({ currentRole, onNavigateToProduct }: AIWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    { role: 'assistant', content: "Hi! I'm Chloe, your ElectroMart AI guide. Introduce yourself or ask me anything about our product catalog, order delivery, sizing advice, or seasonal coupons! ⚡" }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FAQ Quick Clicks
  const quickFAQs = [
    { text: "Track active order", val: "Where is my active order ord-8859?" },
    { text: "Any Active Coupons?", val: "What are the latest promotional discount coupons?" },
    { text: "Recommend a phone", val: "Suggest some good smart phones in stock" },
    { text: "Refund Policy", val: "What is your typical returns and refunds exchange policy?" }
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || isLoading) return;

    if (!textToSend) setInputMsg("");
    
    const nextUserMsg = { role: 'user' as const, content: text };
    const historicalMessages = [...messages, nextUserMsg];
    setMessages(prev => [...prev, nextUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historicalMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content })),
          currentRole
        })
      });

      if (!response.ok) {
        throw new Error("Chat api failed");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, our smart brain is currently finishing database synchronization. Please check back in a few seconds or try another query!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1100 }}>
      {/* Floating Action Button */}
      <Fab 
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          transition: "transform 0.2s",
          '&:hover': {
            transform: "scale(1.08)",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          }
        }}
        id="fab-ai-chatbot"
      >
        {isOpen ? <X className="w-6 h-6 animate-spin-once" /> : <Sparkles className="w-6 h-6 animate-pulse text-indigo-300" />}
      </Fab>

      {/* Floating Dialog Page */}
      {isOpen && (
        <Paper 
          elevation={12} 
          id="paper-ai-chat"
          className="w-80 md:w-96 flex flex-col rounded-3xl overflow-hidden"
          sx={{
            position: "absolute",
            bottom: 72,
            right: 0,
            height: "500px",
            border: "1px dashed rgba(226, 232, 240, 0.8)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Header */}
          <Box className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="bg-indigo-600" sx={{ width: 40, height: 40 }}>
                <Bot className="w-5 h-5 text-indigo-100" />
              </Avatar>
              <div>
                <Typography variant="subtitle1" className="font-semibold text-sm flex items-center gap-1.5 leading-none">
                  Chloe AI Assistant <span className="bg-green-500 rounded-full w-2 h-2 inline-block animate-ping"></span>
                </Typography>
                <Typography variant="caption" className="text-slate-400 text-[10px]">
                  ElectroMart Intelligent Copilot
                </Typography>
              </div>
            </div>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "slate.400" }}>
              <X className="w-4 h-4 text-white" />
            </IconButton>
          </Box>

          {/* Banner alert */}
          <Box className="bg-indigo-50 border-b border-indigo-100 px-4 py-1.5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
            <span className="text-[10px] text-indigo-800 font-medium">NLP Catalog Search & Order Status Grounding enabled</span>
          </Box>

          {/* Chat Messages Body */}
          <Box className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm transition-all duration-200 ${
                    m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                  <CircularProgress size={14} className="text-indigo-600" />
                  <span className="text-xs text-slate-500">Chloe thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Click FAQs */}
          <Box className="p-2 bg-white flex gap-1.5 overflow-x-auto border-t border-slate-100 scrollbar-none">
            {quickFAQs.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleSend(faq.val)}
                disabled={isLoading}
                className="flex-shrink-0 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 px-2.5 py-1 rounded-full transition-colors duration-150 whitespace-nowrap border border-slate-200 hover:border-indigo-200"
              >
                {faq.text}
              </button>
            ))}
          </Box>

          {/* Footer Input */}
          <Box className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <InputBase
              placeholder="Ask Chloe anything..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={isLoading}
              className="flex-1 bg-slate-100 rounded-xl px-3 py-1.5 text-sm font-sans focus-within:ring-2 focus-within:ring-indigo-600"
              sx={{ fontFamily: 'Inter, sans-serif' }}
            />
            <IconButton 
              type="submit" 
              onClick={() => handleSend()}
              disabled={!inputMsg.trim() || isLoading}
              sx={{
                background: inputMsg.trim() ? "#0f172a" : "#f1f5f9",
                color: inputMsg.trim() ? "white" : "#cbd5e1",
                '&:hover': {
                  background: "#1e293b"
                }
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
