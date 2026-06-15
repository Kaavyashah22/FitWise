import React, { useState, useRef, useEffect } from "react";
import { Send, User as UserIcon, Bot, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken, getCoachHistory, chatWithCoach, clearChatAPI, ChatMessage } from "@/lib/apiClient";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function CoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to start a new chat session?")) {
      setCurrentSessionId(crypto.randomUUID());
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm FitWise Coach. How can I help you with your fitness journey today?",
      }]);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user?.id)
          .eq("session_id", currentSessionId)
          .order("created_at", { ascending: true });

        if (data && data.length > 0) {
          setMessages(data.map((m: any) => ({
            id: m.id || Date.now().toString(),
            role: m.role,
            content: m.content
          })));
        } else {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm FitWise Coach. How can I help you with your fitness journey today?",
          }]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm FitWise Coach. How can I help you with your fitness journey today?",
        }]);
      } finally {
        setIsFetchingHistory(false);
      }
    };
    
    fetchHistory();
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: LocalMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Insert user message into Supabase
      await supabase.from("chat_messages").insert([{ 
        user_id: user?.id, 
        role: "user", 
        content: userMsg.content,
        session_id: currentSessionId
      }]);

      const API_BASE_URL = import.meta.env.VITE_AI_COACH_URL || "http://localhost:8001";
      const response = await fetch(`${API_BASE_URL}/api/v1/coach/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user?.id,
          session_id: currentSessionId,
          prompt: userMsg.content
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body returned from the server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantReply = "";

      // Push an initial empty assistant message to the UI array
      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

      // Read the stream chunk-by-chunk until the model stops generating
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Decode the raw bytes into a text token
        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;
        
        // Update the LAST message in the chat history state with the new text
        setMessages((prev) => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1].content = assistantReply;
          return updatedHistory;
        });
      }

      // Insert the final assistant reply into Supabase
      await supabase.from("chat_messages").insert([{ 
        user_id: user?.id, 
        role: "assistant", 
        content: assistantReply,
        session_id: currentSessionId
      }]);

    } catch (error: any) {
      const errorMsg: LocalMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `**Error:** ${error.message || "Something went wrong."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto rounded-2xl overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-zinc-900/50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
            <Bot className="w-6 h-6 text-primary" />
            FitWise Coach
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">Personalized AI fitness guidance</p>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
        {isFetchingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-700 shadow-inner border border-white/10">
              {msg.role === "user" ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-primary" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === "user" 
                ? "bg-gradient-to-br from-green-500 to-green-700 shadow-md text-white" 
                : "bg-zinc-800/80 border border-white/10 text-zinc-200 shadow-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 whitespace-pre-wrap">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="leading-relaxed">{msg.content}</p>
              )}
            </div>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-4"
            >
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-700 shadow-inner border border-white/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-zinc-800/80 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-2 text-zinc-400 shadow-md">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
              </span>
              <span className="ml-2 text-sm bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent animate-pulse">Coach is typing...</span>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-zinc-900/50">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            className="flex-1 bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12 shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-br from-primary to-green-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg flex items-center justify-center shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
