import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Bot,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Mic,
  MicOff,
  Copy,
  Settings,
  AlertCircle,
} from "lucide-react";
import VoiceInput from "../components/VoiceInput";

// Message formatter component to handle markdown-like formatting
const FormattedMessage = ({ content }) => {
  const formatMessage = (text) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split("\n\n");

    return paragraphs
      .map((paragraph, pIndex) => {
        // Handle numbered lists (1. 2. 3. etc.)
        if (/^\d+\./.test(paragraph.trim())) {
          const listItems = paragraph.split(/(?=\d+\.)/);
          return (
            <ol
              key={pIndex}
              className="list-decimal list-inside space-y-2 mb-4"
            >
              {listItems
                .filter((item) => item.trim())
                .map((item, lIndex) => {
                  const cleanItem = item.replace(/^\d+\.\s*/, "").trim();
                  return (
                    <li key={lIndex} className="leading-relaxed">
                      {formatInlineText(cleanItem)}
                    </li>
                  );
                })}
            </ol>
          );
        }

        // Handle bullet points (* or -)
        if (
          /^[\*\-]\s/.test(paragraph.trim()) ||
          paragraph.includes("\n* ") ||
          paragraph.includes("\n- ")
        ) {
          const listItems = paragraph.split(/\n(?=[\*\-]\s)/);
          return (
            <ul key={pIndex} className="list-disc list-inside space-y-2 mb-4">
              {listItems
                .filter((item) => item.trim())
                .map((item, lIndex) => {
                  const cleanItem = item.replace(/^[\*\-]\s*/, "").trim();
                  return (
                    <li key={lIndex} className="leading-relaxed">
                      {formatInlineText(cleanItem)}
                    </li>
                  );
                })}
            </ul>
          );
        }

        // Regular paragraph
        if (paragraph.trim()) {
          return (
            <p key={pIndex} className="mb-3 leading-relaxed">
              {formatInlineText(paragraph)}
            </p>
          );
        }

        return null;
      })
      .filter(Boolean);
  };

  const formatInlineText = (text) => {
    // Handle bold text **text**
    let formatted = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-white">$1</strong>'
    );

    // Handle italic text *text*
    formatted = formatted.replace(
      /(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g,
      '<em class="italic">$1</em>'
    );

    // Handle code blocks `code`
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="bg-black/30 px-2 py-1 rounded text-sm font-mono">$1</code>'
    );

    // Split by HTML tags to preserve them while processing line breaks
    const parts = formatted.split(/(<[^>]*>)/);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith("<") && parts[i].endsWith(">")) {
        // This is an HTML tag, keep it as is
        result.push(
          <span key={i} dangerouslySetInnerHTML={{ __html: parts[i] }} />
        );
      } else {
        // This is text content, handle line breaks
        const lines = parts[i].split("\n");
        lines.forEach((line, lineIndex) => {
          if (lineIndex > 0) {
            result.push(<br key={`br-${i}-${lineIndex}`} />);
          }
          if (line.trim()) {
            result.push(<span key={`text-${i}-${lineIndex}`}>{line}</span>);
          }
        });
      }
    }

    return result.length === 1 && typeof result[0] === "string" ? (
      <span dangerouslySetInnerHTML={{ __html: formatted }} />
    ) : (
      result
    );
  };

  return <div className="formatted-message">{formatMessage(content)}</div>;
};

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL = "http://localhost:8000";

  const legalCategories = [
    "Criminal Law",
    "Civil Law",
    "Family Law",
    "Property Law",
    "Labor Law",
    "Consumer Rights",
  ];

  // Initialize userId from sessionStorage or create new one
  useEffect(() => {
    const initializeUserId = () => {
      try {
        let storedUserId = sessionStorage.getItem("userId");
        let actualUserId = null;

        if (!storedUserId) {
          // Don't generate userId if none exists - user must be logged in
          actualUserId = null;
          console.log("No userId found - user not logged in");
        } else {
          console.log("Raw userId from sessionStorage:", storedUserId);

          // Check if storedUserId is a JSON object or plain string
          try {
            const userObj = JSON.parse(storedUserId);
            if (userObj && userObj.id) {
              // It's a user object, extract the ID
              actualUserId = userObj.id;
              console.log("Extracted userId from user object:", actualUserId);
            } else {
              // It's malformed JSON, treat as string
              actualUserId = storedUserId;
              console.log(
                "Using malformed JSON as plain userId:",
                actualUserId
              );
            }
          } catch (parseError) {
            // Not JSON, it's a plain string
            actualUserId = storedUserId;
            console.log("Using plain string userId:", actualUserId);
          }
        }

        setUserId(actualUserId);
      } catch (error) {
        console.error("Error accessing sessionStorage:", error);
        // Don't create fallback userId - user must be logged in
        setUserId(null);
        console.log("SessionStorage error - user not logged in");
      }
    };

    initializeUserId();
  }, []);

  // Load chat history once userId is available
  useEffect(() => {
    if (userId) {
      loadChatHistory();
    }
  }, [userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    if (!userId) {
      console.log("No userId available, skipping chat history load");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Loading chat history for userId:", userId);

      const response = await fetch(`${API_BASE_URL}/chat/history/${userId}`);
      console.log("History response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load chat history`);
      }

      const data = await response.json();
      console.log("History data:", data);

      if (
        data.success &&
        data.data &&
        data.data.history &&
        data.data.history.length > 0
      ) {
        const formattedMessages = [];
        data.data.history.forEach((record, index) => {
          // Add user message
          formattedMessages.push({
            id: `user_${record.id}_${index}`,
            type: "user",
            content: record.user,
            timestamp: new Date(record.timestamp),
            status: "sent",
          });

          // Add bot message
          formattedMessages.push({
            id: `bot_${record.id}_${index}`,
            type: "bot",
            content: record.bot,
            timestamp: new Date(record.timestamp),
            status: "delivered",
          });
        });
        setMessages(formattedMessages);
        console.log(
          "Loaded",
          formattedMessages.length,
          "messages from history"
        );
      } else {
        // Show welcome message if no history
        console.log("No chat history found, showing welcome message");
        setMessages([
          {
            id: "welcome",
            type: "bot",
            content:
              "Welcome to SEVAK Legal Assistant! I'm here to help you with legal questions and guidance. How can I assist you today?",
            timestamp: new Date(),
            status: "delivered",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setError(`Failed to load chat history: ${error.message}`);
      // Show welcome message on error
      setMessages([
        {
          id: "welcome",
          type: "bot",
          content:
            "Welcome to SEVAK Legal Assistant! I'm here to help you with legal questions and guidance. How can I assist you today?",
          timestamp: new Date(),
          status: "delivered",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !userId) {
      console.log("Cannot send message: missing input or userId");
      return;
    }

    const userMessage = {
      id: `user_${Date.now()}`,
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputMessage.trim();
    setInputMessage("");
    setIsTyping(true);
    setError(null);

    try {
      // Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
        )
      );

      console.log("Sending request to:", `${API_BASE_URL}/chat/chat`);
      console.log("Request payload:", { userId, message: messageContent });

      const response = await fetch(`${API_BASE_URL}/chat/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          message: messageContent,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);

        // Parse error response if it's JSON
        let errorMessage = `HTTP ${response.status}: Failed to get response`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errors && errorData.errors.exception) {
            errorMessage += ` (${errorData.errors.exception})`;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${
            errorText || "Failed to get response"
          }`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success && data.data && data.data.reply) {
        const botMessage = {
          id: `bot_${Date.now()}`,
          type: "bot",
          content: data.data.reply,
          timestamp: new Date(),
          status: "delivered",
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(`Failed to send message: ${error.message}`);

      // Add error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: "bot",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        status: "error",
      };

      setMessages((prev) => [...prev, errorMessage]);
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
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearError = () => {
    setError(null);
  };

  // Show login prompt if not logged in
  if (!userId) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md mx-4">
          <Bot className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-slate-300 mb-6">
            You need to be logged in to access SEVAK Legal Assistant.
          </p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col overflow-hidden no-scrollbar">
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
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-900 rounded-full animate-pulse"></div>
            </div>

            <div>
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>SEVAK Assistant</span>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </h1>
              <p className="text-sm text-slate-400">
                Legal AI • Always available
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">
            ID: {userId?.slice(-8)}
          </span>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 text-slate-400 hover:text-white">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 no-scrollbar">
        {/* Messages */}
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
                  {/* Use FormattedMessage component for bot messages */}
                  {message.type === "bot" ? (
                    <FormattedMessage content={message.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
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
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || !userId}
            className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 ${
              inputMessage.trim() && !isTyping && userId
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
  );
}

export default Chat;