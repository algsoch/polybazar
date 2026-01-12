'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import useWebSocket from '@/hooks/useWebSocket';

export default function ChatWidget({ productId, sellerId, productName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { sendMessage, lastMessage, isConnected, connect } = useWebSocket({
    url: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'}/chat`,
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      console.log('WebSocket connected');
    },
  });

  function handleWebSocketMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        setMessages(prev => [...prev, data]);
      } else if (data.type === 'stream') {
        // Handle streaming token
        setIsStreaming(true);
        setStreamingText(prev => prev + data.token);
      } else if (data.type === 'stream_end') {
        // End of streaming
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'message',
          content: streamingText,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        }]);
        setStreamingText('');
        setIsStreaming(false);
      } else if (data.type === 'offer') {
        // Negotiation offer
        setMessages(prev => [...prev, {
          ...data,
          type: 'offer',
        }]);
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !isConnected) return;

    const newMessage = {
      id: Date.now(),
      type: 'message',
      content: message,
      sender: 'user',
      productId,
      sellerId,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    sendMessage(JSON.stringify(newMessage));
    setMessage('');
    inputRef.current?.focus();
  }, [message, isConnected, productId, sellerId, sendMessage]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendOffer = (price) => {
    const offerMessage = {
      type: 'offer',
      offerPrice: price,
      productId,
      sellerId,
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, {
      ...offerMessage,
      id: Date.now(),
      sender: 'user',
    }]);
    sendMessage(JSON.stringify(offerMessage));
  };

  const respondToOffer = (offerId, accepted) => {
    const response = {
      type: 'offer_response',
      offerId,
      accepted,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => prev.map(msg => 
      msg.id === offerId ? { ...msg, responded: true, accepted } : msg
    ));
    sendMessage(JSON.stringify(response));
  };

  const openChat = () => {
    setIsOpen(true);
    if (!isConnected) {
      connect();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 flex items-center justify-center"
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
        {messages.filter(m => m.sender !== 'user' && !m.read).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-tiny font-bold rounded-full flex items-center justify-center">
            {messages.filter(m => m.sender !== 'user' && !m.read).length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-dropdown z-50 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
            <div>
              <h3 className="font-semibold">Chat with Seller</h3>
              <p className="text-primary-100 text-tiny truncate max-w-[200px]">{productName}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="px-4 py-2 bg-warning-light text-warning text-tiny text-center">
              Connecting...
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center py-8 text-neutral-muted">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-small">Start a conversation with the seller</p>
                <p className="text-tiny mt-1">You can also make price offers</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'offer' ? (
                  <OfferCard
                    offer={msg}
                    isOwn={msg.sender === 'user'}
                    onRespond={respondToOffer}
                  />
                ) : (
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : msg.sender === 'ai'
                        ? 'bg-accent-50 text-gray-900 rounded-bl-md border border-accent-200'
                        : 'bg-neutral-bg text-gray-900 rounded-bl-md'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <span className="text-tiny text-accent font-medium block mb-1">AI Assistant</span>
                    )}
                    <p className="text-small whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[10px] ${msg.sender === 'user' ? 'text-primary-100' : 'text-neutral-muted'} mt-1 block`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Response */}
            {isStreaming && streamingText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-accent-50 text-gray-900 rounded-bl-md border border-accent-200">
                  <span className="text-tiny text-accent font-medium block mb-1">AI Assistant</span>
                  <p className="text-small whitespace-pre-wrap streaming-cursor">{streamingText}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Offer Buttons */}
          <div className="px-4 py-2 border-t border-neutral-border flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => sendOffer(100)}
              className="shrink-0 px-3 py-1 bg-accent-50 text-accent text-tiny font-medium rounded-full hover:bg-accent-100 transition-colors"
            >
              Offer ₹100/kg
            </button>
            <button
              onClick={() => sendOffer(85)}
              className="shrink-0 px-3 py-1 bg-accent-50 text-accent text-tiny font-medium rounded-full hover:bg-accent-100 transition-colors"
            >
              Offer ₹85/kg
            </button>
            <button
              onClick={() => sendOffer(75)}
              className="shrink-0 px-3 py-1 bg-accent-50 text-accent text-tiny font-medium rounded-full hover:bg-accent-100 transition-colors"
            >
              Offer ₹75/kg
            </button>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neutral-border">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="input py-2 flex-1"
                disabled={!isConnected}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || !isConnected}
                className="btn-primary p-3 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OfferCard({ offer, isOwn, onRespond }) {
  const isExpired = new Date(offer.expireAt) < new Date();

  return (
    <div className={`w-full max-w-[85%] rounded-xl border-2 overflow-hidden ${
      isOwn ? 'border-primary bg-primary-50 ml-auto' : 'border-accent bg-accent-50'
    }`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-tiny font-medium ${isOwn ? 'text-primary' : 'text-accent'}`}>
            {isOwn ? 'Your Offer' : 'Seller\'s Offer'}
          </span>
          {offer.responded && (
            <span className={`text-tiny font-medium ${offer.accepted ? 'text-success' : 'text-danger'}`}>
              {offer.accepted ? 'Accepted' : 'Declined'}
            </span>
          )}
        </div>
        
        <p className="text-h3 font-bold text-gray-900">₹{offer.offerPrice}/kg</p>
        
        <p className="text-tiny text-neutral-muted mt-1">
          {isExpired ? 'Expired' : `Expires: ${new Date(offer.expireAt).toLocaleString()}`}
        </p>
      </div>

      {!isOwn && !offer.responded && !isExpired && (
        <div className="flex border-t border-neutral-border">
          <button
            onClick={() => onRespond(offer.id, true)}
            className="flex-1 py-2 flex items-center justify-center gap-1 text-success font-medium hover:bg-success-light transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => onRespond(offer.id, false)}
            className="flex-1 py-2 flex items-center justify-center gap-1 text-danger font-medium hover:bg-danger-light transition-colors border-l border-neutral-border"
          >
            <XCircleIcon className="w-4 h-4" />
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
