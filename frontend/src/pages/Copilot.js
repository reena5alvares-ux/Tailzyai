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
    <div className="max-w-4xl mx-auto" data-testid="copilot-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-heading font-bold text-foreground">Pet Care Copilot</h1>
        </div>
        <p className="text-lg text-muted-foreground">Ask me anything about your pet's health and activities</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
      >
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 chat-scroll" data-testid="chat-messages">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3">Start a Conversation</h3>
                  <p className="text-muted-foreground mb-6">
                    I have access to all your pet's data. Ask me about their health, activities, or get care advice!
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-muted-foreground">"💬 How is my pet's health trending?"</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-muted-foreground">"💊 When was the last vaccination?"</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-muted-foreground">"🏋️ Are they getting enough exercise?"</p>
                    </div>
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
                  className={`max-w-[80%] rounded-[1.5rem] px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white shadow-[0_4px_12px_rgba(255,134,96,0.3)]'
                      : 'bg-white border-2 border-orange-100/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="max-w-[80%] rounded-[1.5rem] px-6 py-4 bg-white border-2 border-orange-100/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
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

          <div className="border-t-2 border-orange-100/50 p-6 bg-muted/50">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your pet's health, activities, or get care advice..."
                className="flex-1 rounded-2xl border-2 border-orange-100 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[60px] max-h-[120px] resize-none"
                disabled={loading}
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-[60px] w-[60px] rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] flex items-center justify-center"
                data-testid="send-button"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}