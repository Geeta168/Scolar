import React, { useState, useEffect, useRef } from "react";
import { getGuidanceChat, sendGuidanceMessage } from "../api";
import { MessageCircle, X, Send } from "lucide-react";

const PostAiGuidance = ({ postId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen, postId]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const loadChats = async () => {
    try {
      const res = await getGuidanceChat(postId);
      if (res.success && res.chats.length > 0) {
        setChats(res.chats);
      } else {
        setChats([{ role: "ai", message: "Hi! How can I help you regarding this specific scholarship post?" }]);
      }
    } catch (err) {
      setChats([{ role: "ai", message: `Error loading: ${err.message}` }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setChats(prev => [...prev, { role: "user", message: userMessage }]);
    setLoading(true);

    try {
      const res = await sendGuidanceMessage(postId, userMessage);
      if (res.success) {
        setChats(prev => [...prev, { role: "ai", message: res.response }]);
      } else {
        setChats(prev => [...prev, { role: "ai", message: `Oops: ${res.error || res.message || "Unknown error"}` }]);
      }
    } catch (err) {
      setChats(prev => [...prev, { role: "ai", message: `Network Error: ${err.message}` }]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed right-8 bottom-8 flex flex-col items-end z-[60]">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold font-sans text-lg drop-shadow-sm">Post Guidance AI</h3>
              <p className="text-sm text-blue-100/80">I can analyze this post!</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
               <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-72 min-h-[250px] flex flex-col gap-3">
            {chats.map((chat, idx) => (
              <div
                key={idx}
                className={
                  "max-w-[85%] p-3 rounded-2xl text-sm " +
                  (chat.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none self-end"
                    : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 self-start shadow-sm")
                }
              >
                {chat.message}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none border border-gray-200 p-3 self-start shadow-sm animate-pulse w-1/2">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-200 flex gap-2 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for guidance..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all border border-transparent shadow-inner"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center gap-2"
        >
          <MessageCircle size={24} />
          <span className="font-semibold text-sm">AI Guidance</span>
        </button>
      )}
    </div>
  );
};

export default PostAiGuidance;
