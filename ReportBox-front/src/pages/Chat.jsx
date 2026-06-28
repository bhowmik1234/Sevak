import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  User,
  Bot,
  Sparkles,
  CheckCircle,
  Copy,
  AlertCircle,
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  Globe,
  Volume2,
  Square,
  ThumbsUp,
  ThumbsDown,
  Search,
  Pin,
  Pencil,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import VoiceInput from "../components/VoiceInput";
import Disclaimer from "../components/Disclaimer";
import { useLanguage } from "../context/LanguageContext";

// Guided intake — common situations shown on a fresh chat.
const SCENARIOS = [
  {
    title: "File an FIR",
    prompt:
      "I want to file an FIR / police complaint. What are my rights and the steps to do it?",
  },
  {
    title: "Domestic violence help",
    prompt:
      "I am facing domestic violence. What legal protection do I have and what should I do?",
  },
  {
    title: "Workplace / wage issue",
    prompt:
      "My employer has not paid my wages. What does the law say and how do I claim them?",
  },
  {
    title: "Online fraud / cyber crime",
    prompt:
      "I was a victim of online fraud. How do I report cyber crime and what are my rights?",
  },
  {
    title: "Consumer complaint",
    prompt:
      "I bought a defective product and the seller refuses a refund. What can I do legally?",
  },
  {
    title: "Tenant / property dispute",
    prompt:
      "I have a dispute with my landlord about my rented house. What are my rights?",
  },
];

// Renders assistant messages as Markdown. react-markdown does not render raw
// HTML by default, so this avoids the XSS surface of dangerouslySetInnerHTML.
const FormattedMessage = ({ content }) => (
  <div className="formatted-message">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="mb-3 leading-relaxed" {...props} />,
        ul: (props) => (
          <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
        ),
        ol: (props) => (
          <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />
        ),
        li: (props) => <li className="leading-relaxed" {...props} />,
        strong: (props) => (
          <strong className="font-semibold text-white" {...props} />
        ),
        em: (props) => <em className="italic" {...props} />,
        code: (props) => (
          <code
            className="bg-black/30 px-2 py-1 rounded text-sm font-mono"
            {...props}
          />
        ),
        a: (props) => (
          <a
            className="text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

// --- Conversation persistence helpers -------------------------------------
// The FastAPI backend stores one flat message log per user, so multiple
// "chat environments" are managed entirely on the client. Conversations are
// kept in localStorage keyed by user id, and seeded once from the server's
// /chat/history endpoint so existing history is never lost.
const CHATS_KEY = (id) => `sevak_chats_${id || "anon"}`;
const ACTIVE_KEY = (id) => `sevak_active_chat_${id || "anon"}`;

const WELCOME_TEXT =
  "Welcome to SEVAK Legal Assistant! I'm here to help you with legal questions and guidance. How can I assist you today?";

const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const nowIso = () => new Date().toISOString();

const makeWelcomeMessage = () => ({
  id: genId(),
  type: "bot",
  content: WELCOME_TEXT,
  timestamp: nowIso(),
  status: "delivered",
});

const makeConversation = (title = "New Chat") => ({
  id: genId(),
  title,
  pinned: false,
  messages: [makeWelcomeMessage()],
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

const titleFromText = (text) => {
  const trimmed = (text || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "New Chat";
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
};

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageReady, setStorageReady] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [speakingId, setSpeakingId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const { language, setLanguage, speechCode, languages } = useLanguage();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const legalCategories = [
    "Criminal Law",
    "Civil Law",
    "Family Law",
    "Cyber Law",
    "Labor & Wages",
    "Consumer Rights",
  ];

  const activeConversation =
    conversations.find((c) => c.id === activeId) || null;
  const messages = activeConversation?.messages ?? [];
  const hasUserMessage = messages.some((m) => m.type === "user");

  const query = search.trim().toLowerCase();
  const sortedConversations = conversations
    .filter((c) => !query || c.title.toLowerCase().includes(query))
    .sort((a, b) => {
      // Pinned conversations float to the top, then most-recently-updated.
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  // Initialize auth (JWT + user) from sessionStorage
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem("token");
      const storedUser = sessionStorage.getItem("user");

      setToken(storedToken);
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserId(userObj?.id ?? null);
      }

      // Not logged in — stop the loading spinner so the login prompt shows.
      if (!storedToken) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error reading auth from sessionStorage:", err);
      setToken(null);
      setUserId(null);
      setIsLoading(false);
    }
  }, []);

  // Load conversations once authenticated (localStorage first, server seed once)
  useEffect(() => {
    if (!token || hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Persist conversations whenever they change (after the initial load)
  useEffect(() => {
    if (!storageReady) {
      return;
    }
    try {
      localStorage.setItem(CHATS_KEY(userId), JSON.stringify(conversations));
      if (activeId) {
        localStorage.setItem(ACTIVE_KEY(userId), activeId);
      }
    } catch (err) {
      console.error("Failed to persist conversations:", err);
    }
  }, [conversations, activeId, userId, storageReady]);

  // Auto-scroll to bottom when the active conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId, isTyping]);

  // Stop any ongoing speech when leaving the page.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const raw = localStorage.getItem(CHATS_KEY(userId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          const storedActive = localStorage.getItem(ACTIVE_KEY(userId));
          setActiveId(
            parsed.some((c) => c.id === storedActive)
              ? storedActive
              : parsed[0].id
          );
          return;
        }
      }
      // No local conversations yet — seed from the server history (one-time).
      await seedFromServer();
    } catch (err) {
      console.error("Error loading conversations:", err);
      const conv = makeConversation();
      setConversations([conv]);
      setActiveId(conv.id);
    } finally {
      setIsLoading(false);
      setStorageReady(true);
    }
  };

  const seedFromServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const history = data?.data?.history ?? [];

        if (history.length > 0) {
          const seededMessages = [];
          history.forEach((record, index) => {
            seededMessages.push({
              id: `user_${record.id}_${index}`,
              type: "user",
              content: record.user,
              timestamp: record.timestamp || nowIso(),
              status: "sent",
            });
            seededMessages.push({
              id: `bot_${record.id}_${index}`,
              type: "bot",
              content: record.bot,
              timestamp: record.timestamp || nowIso(),
              status: "delivered",
            });
          });

          const conv = {
            id: genId(),
            title: titleFromText(history[0].user) || "Previous conversation",
            pinned: false,
            messages: seededMessages,
            createdAt: history[0].timestamp || nowIso(),
            updatedAt: history[history.length - 1].timestamp || nowIso(),
          };
          setConversations([conv]);
          setActiveId(conv.id);
          return;
        }
      }
    } catch (err) {
      console.error("Error seeding conversations from server:", err);
    }

    // Fresh start when there is nothing to import.
    const conv = makeConversation();
    setConversations([conv]);
    setActiveId(conv.id);
  };

  const appendMessage = (convId, message) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, message], updatedAt: nowIso() }
          : c
      )
    );
  };

  const patchMessage = (convId, messageId, patch) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...patch } : m
              ),
            }
          : c
      )
    );
  };

  const handleNewChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    const conv = makeConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setSidebarOpen(false);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelectConversation = (id) => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    setActiveId(id);
    setSidebarOpen(false);
    setError(null);
  };

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation();
    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const conv = makeConversation();
      setConversations([conv]);
      setActiveId(conv.id);
      return;
    }
    setConversations(remaining);
    if (id === activeId) {
      setActiveId(remaining[0].id);
    }
  };

  const handleTogglePin = (id, e) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const startRename = (conv, e) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const commitRename = (id) => {
    const title = renameValue.trim();
    if (title) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  };

  const speakMessage = (message) => {
    if (!("speechSynthesis" in window)) return;
    // Toggle: clicking the speaker on a message that's playing stops it.
    if (speakingId === message.id) {
      stopSpeaking();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = speechCode;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  const sendFeedback = async (message, rating) => {
    if (feedbackGiven[message.id]) return;
    setFeedbackGiven((prev) => ({ ...prev, [message.id]: rating }));

    // The preceding user message is the question this answer responded to.
    const idx = messages.findIndex((m) => m.id === message.id);
    let question = "";
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].type === "user") {
        question = messages[i].content;
        break;
      }
    }

    try {
      await fetch(`${API_BASE_URL}/chat/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, question, answer: message.content }),
      });
    } catch (err) {
      console.error("Failed to send feedback:", err);
    }
  };

  const handleSendMessage = async (overrideText) => {
    const content = (
      typeof overrideText === "string" ? overrideText : inputMessage
    ).trim();
    if (!content || !token) {
      return;
    }

    // Make sure there is an active conversation to write into.
    let convId = activeId;
    if (!convId) {
      const conv = makeConversation();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      convId = conv.id;
    }

    const userMessage = {
      id: `user_${Date.now()}`,
      type: "user",
      content,
      timestamp: nowIso(),
      status: "sending",
    };

    // Append the user message and title the conversation from the first prompt.
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const isFirstUserMsg = !c.messages.some((m) => m.type === "user");
        return {
          ...c,
          title: isFirstUserMsg ? titleFromText(content) : c.title,
          messages: [...c.messages, userMessage],
          updatedAt: nowIso(),
        };
      })
    );

    setInputMessage("");
    setIsTyping(true);
    setError(null);

    try {
      patchMessage(convId, userMessage.id, { status: "sent" });

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content, language }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: Failed to get response`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errors && errorData.errors.exception) {
            errorMessage += ` (${errorData.errors.exception})`;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${
            errorText || "Failed to get response"
          }`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.reply) {
        appendMessage(convId, {
          id: `bot_${Date.now()}`,
          type: "bot",
          content: data.data.reply,
          timestamp: nowIso(),
          status: "delivered",
          sources: data.data.sources || [],
          grounded: data.data.grounded !== false,
          refused: data.data.refused === true,
        });
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(`Failed to send message: ${err.message}`);
      appendMessage(convId, {
        id: `error_${Date.now()}`,
        type: "bot",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: nowIso(),
        status: "error",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = (text) => {
    setInputMessage((prev) => prev + " " + text);
  };

  const copyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatRelative = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const clearError = () => setError(null);

  // Show login prompt if not logged in
  if (!token) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md mx-4">
          <Bot className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-slate-300 mb-6">
            You need to be logged in to access SEVAK Legal Assistant.
          </p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading SEVAK Assistant...</p>
          {userId && (
            <p className="text-sm text-slate-400 mt-2">User ID: {userId}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex overflow-hidden no-scrollbar">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — conversation history */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 flex-shrink-0 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-white/10 space-y-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {sortedConversations.length === 0 ? (
            <p className="text-slate-500 text-sm text-center p-4">
              No conversations yet
            </p>
          ) : (
            sortedConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                  conv.id === activeId
                    ? "bg-white/15 border border-white/20"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                {renamingId === conv.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(conv.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(conv.id);
                      if (e.key === "Escape") {
                        setRenamingId(null);
                        setRenameValue("");
                      }
                    }}
                    className="flex-1 bg-slate-800 border border-blue-400/40 rounded-lg px-3 py-2 m-1 text-sm text-white focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => handleSelectConversation(conv.id)}
                    className="flex-1 flex items-center gap-3 px-3 py-3 text-left min-w-0"
                  >
                    {conv.pinned ? (
                      <Pin className="w-4 h-4 flex-shrink-0 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <MessageSquare
                        className={`w-4 h-4 flex-shrink-0 ${
                          conv.id === activeId
                            ? "text-blue-400"
                            : "text-slate-400"
                        }`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRelative(conv.updatedAt)}
                      </p>
                    </div>
                  </button>
                )}

                {renamingId !== conv.id && (
                  <div className="flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={(e) => handleTogglePin(conv.id, e)}
                      title={conv.pinned ? "Unpin" : "Pin"}
                      aria-label="Pin conversation"
                      className={`p-1 rounded-lg hover:bg-white/10 ${
                        conv.pinned
                          ? "text-yellow-400"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => startRename(conv, e)}
                      title="Rename"
                      aria-label="Rename conversation"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      title="Delete conversation"
                      aria-label="Delete conversation"
                      className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/10 text-xs text-slate-500">
          {conversations.length} conversation
          {conversations.length !== 1 ? "s" : ""}
        </div>
      </aside>

      {/* Main chat column */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border-b border-red-500/30 p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-200 hover:text-white"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between relative z-10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
              title="Toggle chat history"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-900 rounded-full animate-pulse"></div>
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>SEVAK Assistant</span>
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-sm text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {activeConversation?.title || "Legal AI • Always available"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm text-slate-200 hover:text-white transition-all duration-300"
              title="Start a new chat"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
            <div
              className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-2 py-1.5"
              title="Answer language"
            >
              <Globe className="w-4 h-4 text-slate-300" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    className="bg-slate-800 text-white"
                  >
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 no-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              } mb-6`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[85%] ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg mt-1 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                      : message.status === "error"
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : message.status === "error" ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="relative group">
                  <div
                    className={`rounded-3xl px-6 py-4 relative shadow-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : message.status === "error"
                        ? "bg-gradient-to-r from-red-600/50 to-red-700/50 border border-red-500/30 text-red-100"
                        : "bg-black/50 backdrop-blur-xl border border-white/20 text-slate-100"
                    }`}
                  >
                    {message.type === "bot" ? (
                      <FormattedMessage content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    )}

                    {/* Low-confidence / unverified caveat */}
                    {message.type === "bot" &&
                      message.grounded === false &&
                      !message.refused && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Parts of this answer could not be fully verified
                            against the legal sources. Please confirm with a
                            qualified lawyer.
                          </span>
                        </div>
                      )}

                    {/* Cited sources */}
                    {message.type === "bot" &&
                      message.sources &&
                      message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs font-semibold text-slate-400 mb-1">
                            Sources
                          </p>
                          <ul className="space-y-1">
                            {message.sources.map((s, i) => (
                              <li key={i} className="text-xs text-slate-400">
                                {s.section ? `${s.section} — ` : ""}
                                {s.source}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Bot actions: listen aloud + answer feedback */}
                    {message.type === "bot" && message.status !== "error" && (
                      <div className="mt-3 flex items-center gap-1">
                        <button
                          onClick={() => speakMessage(message)}
                          title={speakingId === message.id ? "Stop" : "Listen"}
                          className="p-1.5 hover:bg-white/15 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                          {speakingId === message.id ? (
                            <Square className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => sendFeedback(message, "up")}
                          disabled={!!feedbackGiven[message.id]}
                          title="Helpful"
                          className={`p-1.5 rounded-lg transition-all ${
                            feedbackGiven[message.id] === "up"
                              ? "text-green-400"
                              : "text-slate-400 hover:text-white hover:bg-white/15"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => sendFeedback(message, "down")}
                          disabled={!!feedbackGiven[message.id]}
                          title="Not helpful"
                          className={`p-1.5 rounded-lg transition-all ${
                            feedbackGiven[message.id] === "down"
                              ? "text-red-400"
                              : "text-slate-400 hover:text-white hover:bg-white/15"
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        {feedbackGiven[message.id] && (
                          <span className="text-xs text-slate-500 ml-1">
                            Thanks!
                          </span>
                        )}
                      </div>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={() => copyMessage(message.content, message.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 hover:bg-white/20 rounded-full"
                      title="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`flex items-center space-x-2 mt-2 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-xs text-slate-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.type === "user" && (
                      <div className="flex items-center">
                        {message.status === "sending" && (
                          <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {message.status === "sent" && (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Guided intake — shown on a fresh conversation */}
          {!hasUserMessage && !isTyping && (
            <div className="max-w-2xl mx-auto mt-2">
              <p className="text-center text-sm text-slate-400 mb-4">
                Not sure where to start? Pick a common situation:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => handleSendMessage(s.prompt)}
                    className="text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-2xl p-4 transition-all duration-200"
                  >
                    <p className="text-sm font-semibold text-white">
                      {s.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{s.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-6">
              <div className="flex items-end space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl px-6 py-4 shadow-lg">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-black/30 backdrop-blur-xl border-t border-white/10 p-4 relative z-10 flex-shrink-0">
          <Disclaimer className="mb-3" />

          {/* Legal Categories */}
          <div className="mb-4 flex flex-wrap gap-2">
            {legalCategories.map((category, index) => (
              <button
                key={index}
                onClick={() =>
                  setInputMessage(`I need help with ${category.toLowerCase()}`)
                }
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs text-slate-300 hover:text-white transition-all duration-300"
                disabled={isTyping}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-end space-x-3">
            {/* Voice Recording Button */}
            <VoiceInput onVoiceResult={handleVoiceInput} />

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about legal matters... (Press Enter to send)"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 pr-16 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 backdrop-blur-xl no-scrollbar disabled:opacity-50 disabled:cursor-not-allowed"
                rows="1"
                style={{ minHeight: "56px", maxHeight: "120px" }}
                disabled={isTyping}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping || !token}
              className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                inputMessage.trim() && !isTyping && token
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-xl transform hover:scale-110"
                  : "bg-slate-600/50 text-slate-500 cursor-not-allowed"
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
