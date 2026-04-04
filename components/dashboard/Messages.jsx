'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Search, MapPin } from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Annapoorna Food Relief',
      lastMessage: 'Thank you for your donation! We\'ll arrange pickup tomorrow.',
      time: '2 hours ago',
      unread: 2,
      avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop',
      isNGO: true,
    },
    {
      id: 2,
      name: 'Sarah Chen',
      lastMessage: 'Hi! I\'m interested in the study desk. Is it still available?',
      time: '1 day ago',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
      isNGO: false,
    },
    {
      id: 3,
      name: 'City Shelter NGO',
      lastMessage: 'We received your winter jacket. Thank you so much!',
      time: '3 days ago',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop',
      isNGO: true,
    },
  ];

  const messages = {
    1: [
      { id: 1, text: 'Hello! I saw your donation listing for winter jackets.', sender: 'them', time: '10:30 AM' },
      { id: 2, text: 'Hi! Yes, I have several winter jackets in good condition.', sender: 'me', time: '10:32 AM' },
      { id: 3, text: 'That\'s wonderful! We\'re collecting warm clothes for our shelter. Could we arrange a pickup?', sender: 'them', time: '10:35 AM' },
      { id: 4, text: 'Absolutely! I\'m available tomorrow afternoon. What time works for you?', sender: 'me', time: '10:37 AM' },
      { id: 5, text: 'Thank you for your donation! We\'ll arrange pickup tomorrow.', sender: 'them', time: '2:15 PM' },
    ],
    2: [
      { id: 1, text: 'Hi! I\'m interested in the study desk. Is it still available?', sender: 'them', time: 'Yesterday' },
      { id: 2, text: 'Yes, it\'s still available! It\'s in good condition.', sender: 'me', time: 'Yesterday' },
    ],
    3: [
      { id: 1, text: 'We received your winter jacket. Thank you so much!', sender: 'them', time: '3 days ago' },
    ],
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle send message logic
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Connect with donors and NGOs in your community.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-[600px]">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedChat === conversation.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.isNGO && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                      {conversation.unread > 0 && (
                        <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-500">{conversation.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                  {selectedConversation.isNGO && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Verified NGO
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages[selectedChat]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender === 'me'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'me' ? 'text-emerald-100' : 'text-gray-500'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
