"use client";
import { useState, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

export default function TeamChat({ teamId, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchMessages = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) return;

      const response = await fetch(`/api/teams/${teamId}/messages`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setLastFetch(Date.now());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`/api/teams/${teamId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [teamId]);

  // Polling for new messages (every 3 seconds)
  useEffect(() => {
    if (!lastFetch) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [lastFetch, teamId]);


  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Carregando mensagens...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border border-gray-300 rounded-xl bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-300 bg-purple/10">
        <h3 className="text-lg font-bold text-purple">Chat do Time</h3>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            Nenhuma mensagem ainda. Seja o primeiro a escrever!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.isOwnMessage
                    ? 'bg-purple text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {!message.isOwnMessage && (
                  <div className="text-xs font-semibold mb-1">
                    {message.senderName}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                <div className={`text-xs mt-1 ${
                  message.isOwnMessage ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple"
            maxLength={1000}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-purple text-white px-6 py-2 rounded-lg hover:bg-pink transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiSend />
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {newMessage.length}/1000 caracteres
        </div>
      </form>
    </div>
  );
}

