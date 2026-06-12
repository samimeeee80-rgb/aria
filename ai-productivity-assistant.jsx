import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are ARIA — an Advanced Reasoning & Intelligence Assistant — a sharp, focused AI productivity assistant for 2026. You help users with:
- Task planning & prioritization
- Writing, editing, and summarizing
- Brainstorming and ideation
- Research and Q&A
- Breaking down complex problems
- Daily schedule optimization

Keep responses concise, actionable, and well-structured. Use bullet points, numbered lists, or headers when it improves clarity. Be direct and get to the point fast. If the user gives you a task, complete it — don't ask unnecessary clarifying questions unless truly needed.`;

const QUICK_ACTIONS = [
  { icon: "✍️", label: "Write something", prompt: "Help me write a professional email to reschedule a meeting." },
  { icon: "📋", label: "Plan my day", prompt: "Help me plan a productive work day. I have meetings at 10am and 3pm, and need to finish a report." },
  { icon: "💡", label: "Brainstorm ideas", prompt: "Give me 10 creative content ideas for a productivity-focused newsletter." },
  { icon: "📝", label: "Summarize text", prompt: "Summarize this in 3 bullet points: [paste your text here]" },
  { icon: "🎯", label: "Break down a goal", prompt: "I want to launch a personal blog in 30 days. Break this down into weekly action steps." },
  { icon: "⚡", label: "Quick task list", prompt: "Give me a prioritized to-do list template for a busy professional." },
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#a78bfa",
          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "fadeSlideIn 0.3s ease"
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 10, flexShrink: 0, marginTop: 4,
          boxShadow: "0 0 12px rgba(124,58,237,0.4)"
        }}>
          ✦
        </div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isUser
          ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
          : "rgba(255,255,255,0.05)",
        color: "#f1f5f9",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "12px 16px",
        fontSize: 14,
        lineHeight: 1.7,
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
        whiteSpace: "pre-wrap",
        backdropFilter: "blur(10px)",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowQuick(false);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry, something went wrong.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowQuick(true);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#f1f5f9",
    }}>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes starFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-8px) rotate(180deg); opacity: 1; }
        }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #475569; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 2px; }
        .quick-btn:hover { background: rgba(124,58,237,0.2) !important; border-color: rgba(124,58,237,0.5) !important; transform: translateY(-1px); }
        .send-btn:hover { background: linear-gradient(135deg, #6d28d9, #4338ca) !important; }
        .clear-btn:hover { color: #a78bfa !important; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 0 20px rgba(124,58,237,0.4)",
            animation: "starFloat 4s ease-in-out infinite"
          }}>✦</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>ARIA</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Productivity Assistant</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#22c55e" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
            Online
          </div>
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#475569", fontSize: 12, transition: "color 0.2s"
            }}>Clear chat</button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", maxWidth: 720, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Welcome */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0 32px", animation: "fadeSlideIn 0.5s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "starFloat 4s ease-in-out infinite" }}>✦</div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, margin: "0 0 8px",
              background: "linear-gradient(135deg, #a78bfa, #818cf8, #60a5fa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em"
            }}>
              What can I help you with?
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              Your AI assistant for writing, planning, research & more.
            </p>
          </div>
        )}

        {/* Quick actions */}
        {showQuick && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10, marginBottom: 24
          }}>
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} className="quick-btn" onClick={() => sendMessage(action.prompt)} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "12px 14px",
                cursor: "pointer", color: "#cbd5e1",
                textAlign: "left", transition: "all 0.2s",
                display: "flex", alignItems: "flex-start", gap: 10,
                animation: `fadeSlideIn 0.4s ease ${i * 0.05}s both`
              }}>
                <span style={{ fontSize: 18 }}>{action.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, marginRight: 10, flexShrink: 0,
              boxShadow: "0 0 12px rgba(124,58,237,0.4)"
            }}>✦</div>
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px 18px 18px 4px"
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px 20px",
        background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16, padding: "10px 12px",
          transition: "border-color 0.2s",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift+Enter for new line)"
            rows={1}
            style={{
              flex: 1, background: "none", border: "none", resize: "none",
              color: "#f1f5f9", fontSize: 14, lineHeight: 1.6,
              fontFamily: "inherit", padding: 0, maxHeight: 140,
            }}
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
            width: 36, height: 36, borderRadius: 10, border: "none",
            background: input.trim() && !loading
              ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
              : "rgba(255,255,255,0.05)",
            color: input.trim() && !loading ? "white" : "#475569",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0, transition: "all 0.2s",
            boxShadow: input.trim() && !loading ? "0 0 16px rgba(124,58,237,0.3)" : "none"
          }}>
            ↑
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 8 }}>
          ARIA · Powered by Claude
        </div>
      </div>
    </div>
  );
}
