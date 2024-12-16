import React, { useState, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { createThread, sendMessage } from './services/openai';

const SUGGESTIONS = [
  "Tell me about CBC.",
  "What does a high MPV indicate?",
  "Explain my culture results.",
  "Ranges for cholesterol?"
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function initThread() {
      try {
        const thread = await createThread();
        setThreadId(thread.id);
        console.log('Thread created:', thread.id);
      } catch (error) {
        console.error('Error creating thread:', error);
      }
    }
    initThread();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('Sending message...');
    console.log('ThreadId:', threadId);
    console.log('Input:', input);

    const userMessage = {
      text: input,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!threadId) {
        throw new Error('Thread ID is not initialized');
      }

      const response = await sendMessage(threadId, input);
      console.log('Response received:', response);

      const assistantMessage = {
        text: response,
        isUser: false,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: "Sorry, there was an error processing your request. " + error.message,
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>Lab Test Insights</h1>
        <p>I'm your lab test consultant for blood tests and microbial cultures. How can I help you today?</p>
      </div>

      {messages.length === 0 && (
        <div className="suggestions">
          {SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="messages">
        {messages.map((message, index) => (
          <div
  					key={index}
  					className={`message ${message.isUser ? 'user-message' : 'assistant-message'}`}
  					dangerouslySetInnerHTML={{
    					__html: message.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  					}}
			></div>

        ))}
        {isLoading && (
          <div className="message assistant-message">
            Gathering intel to answer your question...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <textarea
          className="message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button 
          type="submit" 
          className="send-button" 
          disabled={isLoading || !input.trim()}
        >
          <IoSend size={20} />
        </button>
      </form>

      <footer className="footer">
        <p>Built by Meredith Hurston at The Megovi Group</p>
        <p>
          <span role="img" aria-label="email">📧</span> 
          <a href="mailto:hello@megovi.com"> hello@megovi.com</a>
        </p>
        <p>© 2024 The Megovi Group. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
