import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';

function ChatbotIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Antenna */}
      <line x1="32" y1="8" x2="32" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="32" cy="6" r="3.5" fill="#b08920" stroke="white" strokeWidth="1.5"/>
      {/* Head */}
      <rect x="10" y="16" width="44" height="32" rx="14" fill="white"/>
      {/* Left ear */}
      <rect x="4" y="24" width="8" height="14" rx="4" fill="#d4a029"/>
      {/* Right ear */}
      <rect x="52" y="24" width="8" height="14" rx="4" fill="#d4a029"/>
      {/* Eyes */}
      <path d="M22 32 Q25 28 28 32" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M36 32 Q39 28 42 32" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Smile */}
      <path d="M24 38 Q32 46 40 38" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Speech bubble tail */}
      <path d="M20 48 L16 56 L28 48" fill="white"/>
    </svg>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m HireX Mentor.\n\nI can help you with coding, interview prep, resume tips, and career guidance.\n\nWhat would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await api.chatbot(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <>
      <button className="chatbot-btn" onClick={() => setOpen(!open)} title="HireX Mentor">
        {open ? '\u2715' : <ChatbotIcon size={32} />}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChatbotIcon size={24} />
              <h3>HireX Mentor</h3>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>{'\u2715'}</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
