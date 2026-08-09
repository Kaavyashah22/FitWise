/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { Send, User as UserIcon, Bot, Loader2, MessageSquare, PanelLeftClose, PanelLeft, Plus, Trash2, Sparkles, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { getProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: Date;
}

const LOADING_STRINGS = [
  "Waking up Serverless GPU...",
  "Loading Llama 3 into memory...",
  "Extracting live medical context...",
  "Analyzing your recent workouts...",
  "Generating personalized strategy..."
];

export default function CoachPage() {
  const { user } = useAuth();
  const profile = user ? getProfile(user.id) : null;
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingIndex(0);
      interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_STRINGS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all sessions for the sidebar
  const fetchSessions = async (activeSessionId?: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("session_id, role, content, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const sessionMap = new Map<string, ChatSession>();
        
        data.forEach((msg) => {
          if (!sessionMap.has(msg.session_id)) {
            sessionMap.set(msg.session_id, {
              id: msg.session_id,
              title: "New Chat",
              updatedAt: new Date(msg.created_at)
            });
          }
        });

        // Find the first user message for the title
        [...data].reverse().forEach((msg) => {
          if (msg.role === "user") {
            const s = sessionMap.get(msg.session_id);
            if (s && s.title === "New Chat") {
              s.title = msg.content.length > 30 ? msg.content.substring(0, 30) + "..." : msg.content;
            }
          }
        });

        const sessionList = Array.from(sessionMap.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        setSessions(sessionList);

        if (!currentSessionId && !activeSessionId) {
          if (sessionList.length > 0) {
            setCurrentSessionId(sessionList[0].id);
          } else {
            setCurrentSessionId(crypto.randomUUID());
          }
        } else if (activeSessionId) {
          setCurrentSessionId(activeSessionId);
        }
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      if (!currentSessionId) setCurrentSessionId(crypto.randomUUID());
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    setCurrentSessionId(newId);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm FitWise Coach. How can I help you with your fitness journey today?",
    }]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this chat history?")) return;

    try {
      const { error } = await supabase.from("chat_messages").delete().eq("session_id", sessionIdToDelete);
      if (error) throw error;
      
      const updatedSessions = sessions.filter(s => s.id !== sessionIdToDelete);
      setSessions(updatedSessions);

      // If the deleted session was the currently active one, switch to the newest available, or create a new one.
      if (currentSessionId === sessionIdToDelete) {
        if (updatedSessions.length > 0) {
          setCurrentSessionId(updatedSessions[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      alert("Failed to delete chat session.");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentSessionId) return;
      setIsFetchingHistory(true);
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
      } finally {
        setIsFetchingHistory(false);
      }
    };
    
    fetchHistory();
  }, [currentSessionId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMsg: LocalMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const isFirstMessage = messages.length <= 1;

    try {
      await supabase.from("chat_messages").insert([{ 
        user_id: user?.id, 
        role: "user", 
        content: userMsg.content,
        session_id: currentSessionId
      }]);

      const API_BASE_URL = import.meta.env.VITE_AI_COACH_URL || "http://localhost:8001";
      const response = await fetch(`${API_BASE_URL}/api/v1/coach/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          session_id: currentSessionId,
          prompt: userMsg.content
        })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      if (!response.body) throw new Error("No response body returned from the server.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantReply = "";

      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;
        setMessages((prev) => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1].content = assistantReply;
          return updatedHistory;
        });
      }

      await supabase.from("chat_messages").insert([{ 
        user_id: user?.id, 
        role: "assistant", 
        content: assistantReply,
        session_id: currentSessionId
      }]);

      if (isFirstMessage) {
        fetchSessions(currentSessionId);
      }
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
    <div className="flex h-full w-full bg-background overflow-hidden">
      
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? "100%" : 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-white/5 bg-background flex flex-col overflow-hidden whitespace-nowrap"
          >
            <div className="p-4 border-b border-border/50 flex gap-2">
              <button 
                onClick={handleNewChat}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl py-2.5 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> New Chat
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2.5 hover:bg-secondary rounded-xl text-muted-foreground transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border">
              <div className="text-xs font-medium text-muted-foreground mb-3 px-2 mt-2">Chat History</div>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`group w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    currentSessionId === s.id 
                      ? "bg-primary/20 text-foreground border border-primary/30" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                  }`}
                  onClick={() => {
                    setCurrentSessionId(s.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === s.id ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">{s.title}</span>
                      <span className="text-[10px] text-muted-foreground">{format(s.updatedAt, "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(s.id);
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-sm text-muted-foreground text-center px-4 py-8">
                  No previous chats
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col min-w-0 ${isSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2 tracking-wide">
                <Bot className="w-6 h-6 text-primary" />
                FitWise Coach
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Personalized AI fitness guidance</p>
            </div>
          </div>
        </div>
        
        {/* Context Bar */}
        {profile && (
          <div className="bg-primary/5 border-b border-border/50 px-4 md:px-6 py-2.5 flex items-center gap-3 overflow-x-auto whitespace-nowrap text-xs shadow-inner">
            <span className="text-primary font-medium flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5"/> AI Context:</span>
            {profile.goal && <span className="bg-background/60 px-2.5 py-1 rounded-md border border-primary/20 text-muted-foreground capitalize">Goal: {profile.goal.replace("_", " ")}</span>}
            {profile.activityLevel && <span className="bg-background/60 px-2.5 py-1 rounded-md border border-primary/20 text-muted-foreground capitalize">Activity: {profile.activityLevel.replace("_", " ")}</span>}
            {profile.weight && <span className="bg-background/60 px-2.5 py-1 rounded-md border border-primary/20 text-muted-foreground capitalize">Weight: {profile.weight} kg</span>}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-track]:bg-transparent">
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
                {msg.role === "user" ? <UserIcon className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              
              <div className={`max-w-[85%] md:max-w-[75%] px-5 py-3 shadow-sm ${
                msg.role === "user" 
                  ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" 
                  : "rounded-2xl rounded-tl-sm bg-card border border-border text-card-foreground"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed whitespace-pre-wrap md:text-base">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 text-muted-foreground shadow-sm">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                </span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={loadingIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2 text-sm font-medium text-foreground"
                  >
                    {LOADING_STRINGS[loadingIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts & Input Form */}
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-md flex flex-col items-center">
          
          {messages.length <= 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4 w-full max-w-4xl">
              {["Why did my bench press stall?", "Suggest a new 15-min HIIT routine", "How do I optimize my protein intake?"].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="text-xs bg-secondary/60 hover:bg-primary/20 hover:text-primary hover:border-primary/50 text-muted-foreground border border-border/50 rounded-full px-4 py-1.5 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3" /> {prompt}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2 relative w-full max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach anything..."
              className="flex-1 bg-secondary/80 border border-border/50 rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12 shadow-inner"
              disabled={isLoading || !currentSessionId}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !currentSessionId}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-br from-primary to-green-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg flex items-center justify-center shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
