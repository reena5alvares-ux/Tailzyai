import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

export default function Copilot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const response = await api.get('/chat/history');
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load chat history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat/message', { message: input });
      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingHistory) {
    return <div className="text-center py-12">Loading chat...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto" data-testid="copilot-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-4 rounded-2xl">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">Pet Care Copilot</h1>
        </div>
        <p className="text-base lg:text-lg text-muted-foreground">Your AI assistant with complete access to your pet's health data</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
      >
        <div className="h-[calc(100vh-280px)] min-h-[500px] max-h-[700px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 chat-scroll" data-testid="chat-messages">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3">Start a Conversation</h3>
                  <p className="text-muted-foreground mb-6">
                    I have access to all your pet's data. Ask me about their health, activities, or get care advice!
                  </p>
                  <div className="space-y-3 text-sm">
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl p-4 text-left border border-secondary/20 cursor-pointer"
                    >
                      <p className="font-medium text-foreground">💬 How is my pet's health trending?</p>
                      <p className="text-xs text-muted-foreground mt-1">Get insights from health records</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-left border border-primary/20 cursor-pointer"
                    >
                      <p className="font-medium text-foreground">💊 When was the last vaccination?</p>
                      <p className="text-xs text-muted-foreground mt-1">Check vaccination schedule</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl p-4 text-left border border-blue-500/20 cursor-pointer"
                    >
                      <p className="font-medium text-foreground">🏋️ Are they getting enough exercise?</p>
                      <p className="text-xs text-muted-foreground mt-1">Analyze activity patterns</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex mb-4 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                data-testid={`message-${msg.role}-${idx}`}
              >
                <div
                  className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-white shadow-[0_4px_16px_rgba(255,134,96,0.3)]'
                      : 'bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-100/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="max-w-[85%] rounded-[1.5rem] px-6 py-4 bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-100/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-2 border-orange-100/50 p-4 lg:p-6 bg-gradient-to-br from-muted/50 to-orange-50/30">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your pet's health, activities, or get care advice..."
                className="flex-1 rounded-2xl border-2 border-orange-100 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[60px] max-h-[120px] resize-none shadow-sm"
                disabled={loading}
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-[60px] w-[60px] rounded-full bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-[0px_6px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[6px] flex items-center justify-center transition-all"
                data-testid="send-button"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}