import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to ELEVÉ. I am your virtual beauty consultant. How can I assist you with our luxurious collection today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Backend should run on localhost:5001 (based on index.js)
      const res = await axios.post("http://localhost:5001/api/chat", {
        message: userMessage.content,
        history: messages,
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.message },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now." },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, an error occurred. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all z-50 flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-black/90 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg tracking-wider">ELEVÉ Concierge</h3>
                <p className="text-xs text-gray-300">Virtual Beauty Consultant</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-black text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm p-4 flex items-center space-x-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-black transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about ingredients, skin type..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="text-black disabled:text-gray-300 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
