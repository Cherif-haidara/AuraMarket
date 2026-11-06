import React, { useState, useRef, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProductId?: string;
}

export const AiChatAssistant: React.FC = () => {
  const { isAiChatOpen, setIsAiChatOpen, products, addToCart, setSelectedProductId, setActiveView } = useMarketplace();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: `👋 Bonjour ! Je suis **AuraBot**, votre assistant shopping et support intelligent propulsé par l'IA. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: 'À l\'instant',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    '🔥 Meilleures ventes High-Tech',
    '📦 Délais et frais de livraison',
    '🎉 Codes promos disponibles',
    '🎧 Recommander un casque audio',
  ];

  useEffect(() => {
    if (isAiChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiChatOpen]);

  if (!isAiChatOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4).map((m) => ({ role: m.sender, content: m.text })),
          context: {
            catalogSummary: products.map((p) => ({ id: p.id, name: p.name, price: p.price, category: p.category })),
          },
        }),
      });

      const data = response.ok ? await response.json() : {};
      const replyText = data.reply || "Je suis à votre disposition pour toute autre question sur AuraMarket.";

      // Check if any product is explicitly referenced
      let matchedProdId: string | undefined;
      const lower = replyText.toLowerCase();
      if (lower.includes('aurasound')) matchedProdId = 'prod-001';
      else if (lower.includes('novabook')) matchedProdId = 'prod-002';
      else if (lower.includes('pulse horizon')) matchedProdId = 'prod-003';
      else if (lower.includes('barista')) matchedProdId = 'prod-005';

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProductId: matchedProdId,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          sender: 'assistant',
          text: `Je suis à votre écoute ! Sur AuraMarket, vous bénéficiez de la livraison express 24h avec Aura Prime, de retours sous 30 jours et du paiement sécurisé Stripe, PayPal et Mobile Money.`,
          timestamp: 'À l\'instant',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              AuraBot IA <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">Gemini 3.8 Flash</span>
            </h3>
            <p className="text-[11px] text-slate-300">Conseiller d'achat & support client 24/7</p>
          </div>
        </div>
        <button
          onClick={() => setIsAiChatOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const suggestedProd = msg.suggestedProductId
            ? products.find((p) => p.id === msg.suggestedProductId)
            : null;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[90%]">
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 rounded-tr-none font-medium'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>

              {/* Product Card preview inside assistant message */}
              {suggestedProd && (
                <div className="mt-2 ml-9 p-2.5 bg-white border border-amber-300 rounded-xl shadow-sm max-w-[85%] flex items-center gap-3">
                  <img
                    src={suggestedProd.images[0]}
                    alt={suggestedProd.name}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 truncate">{suggestedProd.name}</h5>
                    <p className="text-amber-600 font-extrabold text-xs">{suggestedProd.price.toFixed(2)} €</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => {
                          addToCart(suggestedProd);
                        }}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 shadow-sm transition"
                      >
                        <ShoppingBag className="w-3 h-3" /> Ajouter
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProductId(suggestedProd.id);
                          setActiveView('product-detail');
                          setIsAiChatOpen(false);
                        }}
                        className="text-slate-600 hover:text-slate-900 text-[10px] font-semibold underline"
                      >
                        Voir fiche
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>AuraBot réfléchit...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 font-medium whitespace-nowrap transition flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Posez une question ou demandez un conseil..."
          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 p-2 rounded-lg font-bold transition flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
