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
    
    // Greetings
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return `Hello ${user?.name || 'there'}! It's great to hear from you. How can I assist you with general health information today?`;
    }

    // Health condition responses (existing)
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('blood sugar')) {
      return "Diabetes management involves monitoring blood sugar levels, following a balanced diet low in refined sugars, regular exercise, and taking prescribed medications. Key tips include eating regular meals, choosing complex carbohydrates, and monitoring your glucose levels as recommended by your doctor. It's crucial to work closely with your healthcare provider for personalized advice.";
    }
    
    if (lowerMessage.includes('blood pressure') || lowerMessage.includes('hypertension')) {
      return "Managing blood pressure involves lifestyle changes like reducing sodium intake, maintaining a healthy weight, regular exercise, limiting alcohol, and managing stress. The DASH diet (rich in fruits, vegetables, and low-fat dairy) can be particularly helpful. Always take prescribed medications as directed by your doctor. Regular check-ups are also very important.";
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return "Headaches can have various causes including tension, dehydration, stress, or underlying conditions. For temporary relief, try rest in a quiet, dark room, stay hydrated, apply a cold or warm compress, and consider over-the-counter pain relievers if appropriate. If headaches are severe, frequent, or accompanied by other concerning symptoms, it's important to consult a healthcare provider for an accurate diagnosis and treatment plan.";
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return "Fever is often a sign that your body is fighting an infection. To manage it, get plenty of rest, stay well-hydrated with fluids, and you can use over-the-counter fever reducers like acetaminophen or ibuprofen if you're uncomfortable. Seek medical attention if your fever exceeds 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms such as difficulty breathing, severe headache, or rash. A doctor can determine the cause and recommend appropriate treatment.";
    }
    
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      return "A balanced diet is fundamental for good health and should include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. To optimize your nutrition, focus on portion control, limit processed foods, and choose nutrient-dense options. For personalized dietary advice, especially if you have specific health conditions or goals, consulting with a registered dietitian or nutritionist is highly recommended.";
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('physical activity')) {
      return "Regular physical activity is crucial for overall health, including heart health, mood, and weight management. Aim for at least 150 minutes of moderate-intensity aerobic activity weekly, such as brisk walking, and incorporate strength training exercises at least twice a week. It's always a good idea to consult your doctor before starting any new exercise program, especially if you have existing health conditions, to ensure it's safe and appropriate for you.";
    }
    
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('prescription')) {
      return "It's extremely important to take any medications exactly as prescribed by your healthcare provider. Never skip doses, stop medications without consulting your doctor, or share your medications with others. Keep an up-to-date list of all medications, supplements, and over-the-counter drugs you're taking, and discuss any potential side effects or concerns with your healthcare team. They can provide guidance on proper use and interactions.";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental health')) {
      return "Managing stress is vital for both your mental and physical well-being. Effective techniques include deep breathing exercises, mindfulness meditation, yoga, maintaining a regular sleep schedule, and engaging in physical activity. If stress or anxiety is significantly impacting your daily life, or if you're experiencing symptoms of depression, please consider talking to a counselor, therapist, or mental health professional. They can offer personalized strategies and support.";
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
      return "Good sleep hygiene is key for restorative sleep. This includes maintaining a consistent sleep schedule, even on weekends, creating a comfortable and dark sleep environment, avoiding caffeine and heavy meals late in the day, and limiting screen time before bed. Most adults need 7-9 hours of sleep nightly. If you consistently struggle with sleep problems, it's advisable to consult a healthcare provider to rule out underlying conditions and get tailored advice.";
    }

    if (lowerMessage.includes('cold') || lowerMessage.includes('flu') || lowerMessage.includes('cough') || lowerMessage.includes('sore throat')) {
        return "For common cold or flu symptoms, rest, stay hydrated, and consider over-the-counter remedies like pain relievers or cough suppressants. Wash your hands frequently to prevent spread. If symptoms worsen, last longer than a week, or include high fever/difficulty breathing, please consult a doctor.";
    }

    if (lowerMessage.includes('allergies') || lowerMessage.includes('allergic reaction') || lowerMessage.includes('hay fever')) {
        return "Allergies occur when your immune system reacts to a harmless substance. Common management includes avoiding triggers, using antihistamines, nasal sprays, or eye drops. For severe reactions (anaphylaxis), seek immediate emergency care. An allergist can help identify specific allergens and develop a management plan.";
    }

    if (lowerMessage.includes('digestion') || lowerMessage.includes('stomach ache') || lowerMessage.includes('indigestion') || lowerMessage.includes('heartburn') || lowerMessage.includes('constipation') || lowerMessage.includes('diarrhea')) {
        return "Common digestive issues can often be managed with dietary adjustments like eating smaller, frequent meals, avoiding trigger foods, and staying hydrated. Probiotics might also be beneficial. For persistent or severe symptoms, or blood in stool, please consult a doctor to rule out serious conditions.";
    }

    if (lowerMessage.includes('back pain') || lowerMessage.includes('spine')) {
        return "For general back pain, try applying heat or ice, gentle stretching, and over-the-counter pain relievers. Maintaining good posture and strengthening core muscles can help prevent recurrence. If pain is severe, constant, radiates down your leg, or is accompanied by numbness/weakness, seek medical attention.";
    }

    if (lowerMessage.includes('skin') || lowerMessage.includes('rash') || lowerMessage.includes('eczema') || lowerMessage.includes('acne')) {
        return "Skin conditions vary greatly. For general skin health, maintain good hygiene, moisturize regularly, and protect from sun exposure. For persistent rashes, severe acne, or any concerning changes in moles, it's best to consult a dermatologist for proper diagnosis and treatment.";
    }
    
    if (lowerMessage.includes('vaccination') || lowerMessage.includes('immunization') || lowerMessage.includes('shots')) {
        return "Vaccinations are crucial for preventing infectious diseases by building immunity. They protect individuals and communities. Please consult your doctor or local health authority for the recommended vaccination schedule for you and your family, including routine childhood immunizations, flu shots, and boosters.";
    }

    if (lowerMessage.includes('smoking cessation') || lowerMessage.includes('quit smoking')) {
        return "Quitting smoking is one of the best things you can do for your health! It significantly reduces risks of heart disease, cancer, and lung conditions. Support options include nicotine replacement therapy, medications, counseling, and support groups. Your doctor can help you create a personalized quit plan.";
    }

    if (lowerMessage.includes('alcohol moderation') || lowerMessage.includes('reduce alcohol')) {
        return "Moderate alcohol consumption, if you choose to drink, means up to one drink per day for women and up to two drinks per day for men. Excessive drinking has serious health risks. If you're concerned about your alcohol intake, please talk to a healthcare professional or a support organization for guidance and resources.";
    }

    if (lowerMessage.includes('heart health') || lowerMessage.includes('cholesterol') || lowerMessage.includes('cardiac')) {
        return "Maintaining good heart health involves a balanced diet low in saturated and trans fats, regular exercise, managing blood pressure and cholesterol, not smoking, and managing stress. Regular check-ups with your doctor are important to monitor your cardiovascular health.";
    }

    if (lowerMessage.includes('child health') || lowerMessage.includes('pediatric')) {
        return "Child health focuses on the physical, mental, and social well-being of infants, children, and adolescents. Key aspects include regular check-ups, vaccinations, balanced nutrition, age-appropriate physical activity, and ensuring a safe, supportive environment. Always consult a pediatrician for specific concerns about your child's health.";
    }

    if (lowerMessage.includes('senior health') || lowerMessage.includes('elderly health')) {
        return "Senior health often focuses on maintaining mobility, cognitive function, managing chronic conditions, and staying socially engaged. Regular health screenings, appropriate exercise, a nutrient-rich diet, and staying connected are vital. Consulting with a geriatrics specialist can provide tailored advice for older adults.";
    }

    if (lowerMessage.includes('vitamins') || lowerMessage.includes('supplements')) {
        return "Vitamins and supplements can play a role in health, but a balanced diet is usually the best source of nutrients. Always discuss with your doctor or a registered dietitian before starting any new supplements, as some can interact with medications or may not be suitable for your specific health needs.";
    }

    if (lowerMessage.includes('hydration') || lowerMessage.includes('water intake')) {
        return "Staying well-hydrated is crucial for all bodily functions, including digestion, temperature regulation, and nutrient absorption. Aim for at least 8 glasses (about 2 liters) of water daily, but individual needs can vary based on activity level, climate, and health conditions. Drink water throughout the day, even if you don't feel thirsty.";
    }

    if (lowerMessage.includes('handwashing') || lowerMessage.includes('hygiene') || lowerMessage.includes('germs')) {
        return "Good hand hygiene, especially handwashing with soap and water for at least 20 seconds, is one of the most effective ways to prevent the spread of infections. Do it frequently, especially after coughing, sneezing, using the bathroom, and before eating or preparing food.";
    }
    
    if (lowerMessage.includes('dental health') || lowerMessage.includes('teeth') || lowerMessage.includes('gums')) {
        return "Maintaining good dental health is vital for overall well-being. Brush your teeth twice a day with fluoride toothpaste, floss daily, and limit sugary foods and drinks. Regular dental check-ups and professional cleanings are essential for preventing cavities, gum disease, and other oral health issues.";
    }

    if (lowerMessage.includes('eye health') || lowerMessage.includes('vision')) {
        return "Protecting your eye health involves regular eye exams, wearing sunglasses to block UV rays, eating a diet rich in eye-friendly nutrients (like Omega-3s, vitamins A, C, E, and zinc), and taking breaks from screens (the 20-20-20 rule). If you experience sudden vision changes, pain, or redness, consult an eye care professional immediately.";
    }

    // --- NEW DISEASE CASES ADDED BELOW ---

    if (lowerMessage.includes('asthma') || lowerMessage.includes('breathing difficulty')) {
        return "Asthma is a chronic respiratory condition where airways narrow and swell, producing extra mucus, which can make breathing difficult. Common triggers include allergens, exercise, cold air, or stress. Management often involves quick-relief inhalers for sudden symptoms and long-term control medications to prevent flare-ups. It's crucial to work with a doctor to develop a personalized asthma action plan and identify your specific triggers.";
    }

    if (lowerMessage.includes('migraine') || lowerMessage.includes('severe headache') || lowerMessage.includes('cluster headache')) {
        return "Migraines are severe headaches often accompanied by throbbing pain, sensitivity to light and sound, nausea, or vomiting. Triggers can vary widely and include certain foods, stress, hormonal changes, or lack of sleep. Treatment involves acute medications to stop a migraine attack and preventive medications to reduce frequency. If you suspect you have migraines, consult a neurologist or healthcare provider for a proper diagnosis and management strategy.";
    }

    if (lowerMessage.includes('thyroid') || lowerMessage.includes('hypothyroidism') || lowerMessage.includes('hyperthyroidism')) {
        return "Thyroid disorders affect your metabolism and overall health. Hypothyroidism (underactive thyroid) can cause fatigue, weight gain, and cold sensitivity. Hyperthyroidism (overactive thyroid) can lead to weight loss, anxiety, and heart palpitations. Both are diagnosed with blood tests. Treatment typically involves medication to balance hormone levels. If you experience symptoms, consult a doctor or an endocrinologist for accurate diagnosis and treatment.";
    }

    // --- END OF NEW DISEASE CASES ---

    // Emergency situations
    if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart attack') || lowerMessage.includes('emergency') || lowerMessage.includes('trouble breathing') || lowerMessage.includes('severe injury') || lowerMessage.includes('stroke symptoms') || lowerMessage.includes('lose consciousness') || lowerMessage.includes('severe bleeding')) {
      return "⚠️ MEDICAL EMERGENCY: If you're experiencing severe symptoms like chest pain, difficulty breathing, sudden weakness, severe injuries, loss of consciousness, severe bleeding, or other life-threatening conditions, please call emergency services (e.g., 911 or your local emergency number) immediately or go to the nearest emergency room. Do not delay seeking immediate medical attention for serious symptoms. I cannot provide emergency medical care.";
    }

    // General health inquiries that need professional guidance
    if (lowerMessage.includes('symptoms') || lowerMessage.includes('diagnosis') || lowerMessage.includes('remedy') || lowerMessage.includes('what should i do for') || lowerMessage.includes('is this serious') || lowerMessage.includes('cure for') || lowerMessage.includes('prescribe me')) {
      return "I understand you're looking for specific medical advice regarding symptoms, diagnosis, or remedies. However, as an AI, I cannot provide personalized medical diagnoses, prescribe medications, or offer treatment plans. It is crucial to consult with a qualified healthcare professional for proper evaluation, diagnosis, and treatment of any health concerns you may have. They can consider your full medical history and provide appropriate guidance.";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting health question. While I can provide general information, I'd recommend discussing this specific concern with your healthcare provider who can give you personalized advice based on your medical history and individual needs.",
      "Thank you for your question. For the most accurate and personalized medical advice, please consult with a qualified healthcare professional who can properly evaluate your situation and provide appropriate guidance.",
      "I'm here to provide general health information and support. For specific medical concerns or symptoms you're experiencing, it's always best and safest to speak directly with your doctor or healthcare provider.",
      "Health matters can be complex and individual. While I can share general information and insights, your healthcare provider is the best person to address your specific health concerns, diagnose conditions, and recommend appropriate treatment strategies."
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