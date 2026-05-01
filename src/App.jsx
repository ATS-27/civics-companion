import { useState, useEffect, useRef } from 'react';
import { Settings, Send, Landmark, User, Bot, Loader2, ExternalLink } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { initAI, sendMessageToAI, setMockMode } from './utils/ai';
import { detectLocationAndGetContext } from './utils/location';

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hello! I am Civics Companion. To give you the most accurate voting steps, could you please tell me what state or union territory in India you are voting in?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mockModeEnabled, setMockModeEnabled] = useState(localStorage.getItem('gemini_mock_mode') === 'true');
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ text: 'Initializing engine...', progress: 0 });
  const chatEndRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    setMockMode(mockModeEnabled);
    
    // Prevent double initialization in React StrictMode
    if (initializedRef.current) return;
    
    if (mockModeEnabled) {
      setIsAiInitialized(true);
      initializedRef.current = true;
    } else {
      const initializeModel = async () => {
        try {
          const success = await initAI((progress) => {
            setDownloadProgress({
              text: progress.text,
              progress: Math.round(progress.progress * 100)
            });
          });
          setIsAiInitialized(success);
          initializedRef.current = true;
        } catch (error) {
          console.error("Failed to load model", error);
        }
      };
      
      initializeModel();
    }
  }, [mockModeEnabled]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, downloadProgress]);

  const handleSend = async (customText = null) => {
    // If the event is passed (from onClick), it's not a string, so ignore it
    const textToProcess = typeof customText === 'string' ? customText : inputValue;
    if (!textToProcess.trim() || isLoading || !isAiInitialized) return;

    // Detect state and generate the RAG string
    const ragContext = detectLocationAndGetContext(textToProcess);
    
    // We only display the user's raw input in the UI
    const userMessage = { id: Date.now(), role: 'user', text: textToProcess };
    setMessages(prev => [...prev, userMessage]);
    
    if (typeof customText !== 'string') {
      setInputValue('');
    }
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAI(textToProcess, ragContext);
      const botMessage = { id: Date.now() + 1, role: 'bot', text: responseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, 
        role: 'bot', 
        text: `Sorry, I encountered an error: **${error.message}**\n\nPlease check your browser's WebGPU support.` 
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

  const saveSettings = () => {
    localStorage.setItem('gemini_mock_mode', mockModeEnabled);
    if (mockModeEnabled && !isAiInitialized) {
        setIsAiInitialized(true);
    }
    setShowSettings(false);
  };

  const renderQuickActions = () => {
    if (messages.length === 0 || isLoading || !isAiInitialized) return null;
    const lastMsg = messages[messages.length - 1];
    
    if (lastMsg.role !== 'bot') return null;

    const text = lastMsg.text.toLowerCase();
    
    // Initial State Detection
    if (text.includes('what state or union territory')) {
      return (
        <div className="quick-actions" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', width: '100%' }}>
          <select 
            onChange={(e) => {
              if(e.target.value) {
                handleSend(e.target.value);
              }
            }}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '1rem', cursor: 'pointer' }}
            defaultValue=""
          >
            <option value="" disabled>Select your State / Union Territory...</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>
      );
    }
    
    // Registration Links & Yes/No/Not Sure questions
    if (text.includes('register') || text.includes('form 6') || text.includes('voters.eci.gov.in') || (text.includes('registered') && text.includes('?'))) {
      return (
        <div className="quick-actions" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          {text.includes('?') && (
            <>
              <button onClick={() => handleSend("Yes, I am registered.")} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: 'var(--surface-color)', color: 'white', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 500 }}>Yes, I am</button>
              <button onClick={() => handleSend("No, I am not registered.")} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: 'var(--surface-color)', color: 'white', border: '1px solid var(--border-color)', cursor: 'pointer' }}>No, I am not</button>
              <button onClick={() => handleSend("I am not sure.")} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: 'var(--surface-color)', color: 'white', border: '1px solid var(--border-color)', cursor: 'pointer' }}>Not Sure</button>
            </>
          )}
          
          <a 
            href="https://voters.eci.gov.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              background: '#2196F3', 
              color: 'white', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Apply Online (NVSP Portal) <ExternalLink size={14} />
          </a>
        </div>
      );
    }

    return null;
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
        {!isAiInitialized && !mockModeEnabled && (
          <div className="message bot">
            <div className="avatar">
              <Loader2 size={20} color="var(--accent-color)" style={{ animation: 'spin 2s linear infinite' }} />
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
            <div className="message-content" style={{ borderColor: 'var(--accent-color)', width: '100%', maxWidth: '100%' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Loading Local AI Model...</strong> This happens entirely in your browser. The first load will download about 1GB of data.
              </div>
              <div style={{ background: '#333', borderRadius: '4px', overflow: 'hidden', height: '10px', width: '100%' }}>
                <div 
                  style={{ 
                    background: 'var(--accent-color)', 
                    height: '100%', 
                    width: `${downloadProgress.progress}%`,
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
              <div style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {downloadProgress.text} ({downloadProgress.progress}%)
              </div>
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
        {renderQuickActions()}
        <div className="input-container">
          <textarea
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAiInitialized ? "Type your message here..." : "Downloading AI model..."}
            rows={1}
            disabled={!isAiInitialized}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || !isAiInitialized}
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
                Enable Mock Mode (Skip local model download for fast testing)
              </label>
            </div>
            
            <button className="save-btn" onClick={saveSettings}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
