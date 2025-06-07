import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../types';
import { PDFExportUtil } from '../utils/pdfExport';

const MediBot: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: `Hello ${user?.name || 'there'}! I'm Dr. MediBot, your AI health assistant. I'm here to help answer your health-related questions and provide general medical information. How can I assist you today?`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock AI response generator
  const generateBotResponse = async (userMessage: string): Promise<string> => {
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Health condition responses
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('blood sugar')) {
      return "Diabetes management involves monitoring blood sugar levels, following a balanced diet low in refined sugars, regular exercise, and taking prescribed medications. Key tips include eating regular meals, choosing complex carbohydrates, and monitoring your glucose levels as recommended by your doctor.";
    }
    
    if (lowerMessage.includes('blood pressure') || lowerMessage.includes('hypertension')) {
      return "Managing blood pressure involves lifestyle changes like reducing sodium intake, maintaining a healthy weight, regular exercise, limiting alcohol, and managing stress. The DASH diet (rich in fruits, vegetables, and low-fat dairy) can be particularly helpful. Always take prescribed medications as directed.";
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return "Headaches can have various causes including tension, dehydration, stress, or underlying conditions. For relief, try rest in a quiet, dark room, stay hydrated, apply cold or warm compress, and consider over-the-counter pain relievers if appropriate. If headaches are severe or frequent, consult a healthcare provider.";
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return "Fever is your body's natural response to infection. Rest, stay hydrated with plenty of fluids, and use fever reducers like acetaminophen or ibuprofen if comfortable. Seek medical attention if fever exceeds 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms.";
    }
    
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      return "A balanced diet should include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. For your specific health conditions, focus on portion control, limit processed foods, and choose nutrient-dense options. Consider consulting with a registered dietitian for personalized advice.";
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return "Regular physical activity is crucial for overall health. Aim for at least 150 minutes of moderate-intensity aerobic activity weekly, plus strength training twice a week. Start slowly and gradually increase intensity. Always consult your doctor before starting a new exercise program, especially with existing health conditions.";
    }
    
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      return "It's important to take medications exactly as prescribed by your healthcare provider. Never skip doses, stop medications without consulting your doctor, or share medications with others. Keep a current list of all medications and supplements you're taking, and discuss any side effects with your healthcare team.";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
      return "Managing stress is vital for overall health. Try relaxation techniques like deep breathing, meditation, or yoga. Maintain a regular sleep schedule, stay physically active, and consider talking to a counselor or therapist. If stress or anxiety significantly impacts your daily life, please seek professional help.";
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
      return "Good sleep hygiene includes maintaining a consistent sleep schedule, creating a comfortable sleep environment, avoiding caffeine late in the day, and limiting screen time before bed. Adults should aim for 7-9 hours of sleep nightly. If sleep problems persist, consult a healthcare provider.";
    }
    
    // Emergency situations
    if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart attack') || lowerMessage.includes('emergency')) {
      return "⚠️ MEDICAL EMERGENCY: If you're experiencing chest pain, difficulty breathing, severe injuries, or other emergency symptoms, please call emergency services (911) immediately or go to the nearest emergency room. Do not delay seeking immediate medical attention for serious symptoms.";
    }
    
    // General health responses
    if (lowerMessage.includes('symptoms') || lowerMessage.includes('sick')) {
      return "I understand you're not feeling well. While I can provide general health information, it's important to consult with a healthcare professional for proper diagnosis and treatment. If symptoms are severe or worsen, seek medical attention promptly.";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting health question. While I can provide general information, I'd recommend discussing this specific concern with your healthcare provider who can give you personalized advice based on your medical history.",
      "Thank you for your question. For the most accurate and personalized medical advice, please consult with a qualified healthcare professional who can properly evaluate your situation.",
      "I'm here to provide general health information and support. For specific medical concerns or symptoms you're experiencing, it's best to speak with your doctor or healthcare provider.",
      "Health matters can be complex and individual. While I can share general information, your healthcare provider is the best person to address your specific health concerns and provide appropriate treatment recommendations."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Generate bot response
      const botResponse = await generateBotResponse(inputMessage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to generate response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "I apologize, but I'm having trouble responding right now. Please try again or consult with a healthcare professional for your health concerns.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        message: `Hello ${user?.name || 'there'}! I'm Dr. MediBot, your AI health assistant. I'm here to help answer your health-related questions and provide general medical information. How can I assist you today?`,
        isBot: true,
        timestamp: new Date()
      }
    ]);
  };

  const handleDownloadTranscript = async () => {
    try {
      const transcript = messages.map(msg => 
        `${msg.isBot ? 'Dr. MediBot' : user?.name || 'User'} (${msg.timestamp.toLocaleString()}): ${msg.message}`
      ).join('\n\n');
      
      await PDFExportUtil.generateReportPDF({
        'Chat Transcript': transcript,
        'Session Date': new Date().toLocaleString(),
        'Participant': user?.name || 'User',
        'Total Messages': messages.length.toString()
      }, 'Dr. MediBot Chat Transcript');
    } catch (error) {
      console.error('Failed to generate transcript PDF:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dr. MediBot</h1>
            <p className="text-gray-600">Your AI health assistant for medical questions</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={clearChat}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Chat</span>
          </button>
          <button
            onClick={handleDownloadTranscript}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Transcript</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isBot ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {message.isBot ? (
                    <Bot className="h-5 w-5 text-blue-600" />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`rounded-lg p-4 ${
                  message.isBot 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <p className="text-gray-800 leading-relaxed">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your health concerns, symptoms, medications, or general health questions..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Medical Disclaimer:</strong> Dr. MediBot provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediBot;