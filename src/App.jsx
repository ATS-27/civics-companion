import React, { useState, useEffect, useRef } from 'react';
import { Settings, Send, Landmark, User, Bot, AlertCircle } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { initAI, sendMessageToAI, setMockMode } from './utils/ai';

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hello! I am Civics Companion. To give you the most accurate voting steps, could you please tell me what country and state/province you are voting in?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [mockModeEnabled, setMockModeEnabled] = useState(localStorage.getItem('gemini_mock_mode') === 'true');
  const [availableModels, setAvailableModels] = useState([
    'gemini-3.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setMockMode(mockModeEnabled);
    if (mockModeEnabled) {
      setIsAiInitialized(true);
    } else if (apiKey) {
      const selectedModel = localStorage.getItem('gemini_model') || availableModels[0];
      const initialized = initAI(apiKey, selectedModel);
      setIsAiInitialized(initialized);
    } else {
      setIsAiInitialized(false);
    }
  }, [apiKey, mockModeEnabled, availableModels]);

  const fetchAvailableModels = async () => {
    if (!apiKey) return;
    setFetchingModels(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await res.json();
      if (data.models) {
        const models = data.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));
        if (models.length > 0) {
          setAvailableModels(models);
          if (!models.includes(localStorage.getItem('gemini_model'))) {
             localStorage.setItem('gemini_model', models[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
    } finally {
      setFetchingModels(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!isAiInitialized && !mockModeEnabled) {
      setShowSettings(true);
      return;
    }

    const userMessage = { id: Date.now(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAI(inputValue);
      const botMessage = { id: Date.now() + 1, role: 'bot', text: responseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, 
        role: 'bot', 
        text: `Sorry, I encountered an error: **${error.message}**\n\nPlease check your API key and try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('gemini_mock_mode', mockModeEnabled);
    setMockMode(mockModeEnabled);
    
    if (mockModeEnabled) {
      setIsAiInitialized(true);
    } else {
      const selectedModel = localStorage.getItem('gemini_model') || availableModels[0];
      const initialized = initAI(apiKey, selectedModel);
      setIsAiInitialized(initialized);
    }
    
    setShowSettings(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1>
          <Landmark size={24} />
          Civics Companion
        </h1>
        <button 
          className="settings-btn" 
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <div className="chat-area">
        {!isAiInitialized && (
          <div className="message bot">
            <div className="avatar">
              <AlertCircle size={20} color="var(--accent-color)" />
            </div>
            <div className="message-content" style={{ borderColor: 'var(--accent-color)' }}>
              Welcome to Civics Companion! Please set your Gemini API key in the settings to start our conversation.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="var(--accent-color)" />}
            </div>
            <div 
              className="message-content markdown-body"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(marked.parse(msg.text)) 
              }}
            />
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="avatar">
              <Bot size={20} color="var(--accent-color)" />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            disabled={!isAiInitialized && !mockModeEnabled}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || (!isAiInitialized && !mockModeEnabled)}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <div className={`modal-overlay ${showSettings ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-header">
            <h2>Settings</h2>
            <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                id="mockMode"
                type="checkbox"
                checked={mockModeEnabled}
                onChange={(e) => setMockModeEnabled(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <label htmlFor="mockMode" style={{ marginBottom: 0, color: 'white', fontWeight: 500 }}>
                Enable Mock Mode (No API key required)
              </label>
            </div>
            <div className="form-group" style={{ opacity: mockModeEnabled ? 0.5 : 1, pointerEvents: mockModeEnabled ? 'none' : 'auto' }}>
              <label htmlFor="apiKey">Gemini API Key</label>
              <input
                id="apiKey"
                type="password"
                className="api-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Stored locally.
                </p>
                <button 
                  onClick={fetchAvailableModels} 
                  disabled={!apiKey || fetchingModels}
                  style={{ background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  {fetchingModels ? 'Fetching...' : 'Fetch Models'}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ opacity: mockModeEnabled ? 0.5 : 1, pointerEvents: mockModeEnabled ? 'none' : 'auto' }}>
              <label htmlFor="modelSelect">AI Model</label>
              <select
                id="modelSelect"
                className="api-input"
                value={localStorage.getItem('gemini_model') || availableModels[0]}
                onChange={(e) => {
                  localStorage.setItem('gemini_model', e.target.value);
                  setAvailableModels([...availableModels]); // trigger re-render
                }}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <button className="save-btn" onClick={saveApiKey}>
              Save and Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
