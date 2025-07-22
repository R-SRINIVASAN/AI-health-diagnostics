import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Bot, User, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Assuming this provides user profile

// Define types for better clarity and consistency
interface ChatMessage {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: Date;
}

const MediBot: React.FC = () => {
  const { user } = useAuth(); // Get user details from AuthContext
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: `Hello ${user?.name || 'there'}! I'm Dr. MediBot, your AI health assistant. I'm here to help answer your **general health-related questions** and provide **basic medical information**. How can I assist you today? **Remember, I am not a substitute for a doctor.**`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scrolls the chat to the bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to scroll to bottom whenever messages state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Generates a rule-based response from the bot based on user input.
   * This function uses keyword matching to determine appropriate responses.
   *
   * @param userMessage The user's input message.
   * @returns A promise that resolves to the bot's response string.
   */
  const generateBotResponse = useCallback(async (userMessage: string): Promise<string> => {
    // Simulate a typing delay for a more natural feel
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // --- HIGH PRIORITY: MEDICAL EMERGENCY WARNINGS ---
    // Keywords indicating a potential medical emergency.
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'emergency', 'trouble breathing', 'difficulty breathing', 
      'severe injury', 'stroke symptoms', 'lose consciousness', 'fainted', 'severe bleeding', 
      'unresponsive', 'choking', 'poisoning', 'burns', 'fracture', 'head injury', 'accident',
      'call ambulance', 'urgent care', 'collapse', 'sudden weakness', 'paralysis', '911', '108' // 108 is India's emergency number
    ];
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "⚠️ **MEDICAL EMERGENCY:** If you are experiencing severe symptoms like **chest pain, difficulty breathing, sudden weakness, severe injuries, loss of consciousness, or severe bleeding**, please **call 108 (the emergency ambulance service in India) immediately** or go to the nearest emergency room. **Do not delay seeking immediate medical attention for serious conditions.** I cannot provide emergency medical care.";
    }

    // --- HIGH PRIORITY: Directing to Professional Guidance for Diagnosis/Treatment ---
    // Keywords indicating a user is seeking diagnosis, treatment, or specific medical advice.
    const professionalGuidanceKeywords = [
      'symptoms', 'diagnosis', 'remedy', 'what should i do for', 'is this serious', 
      'cure for', 'prescribe me', 'my medical condition', 'my illness', 'treatment for',
      'medication for', 'what causes', 'is it normal', 'should i be worried', 'what medicine',
      'my test results', 'interpret my report', 'is this disease', 'do I have', 'diagnose me',
      'what is wrong with me', 'how to treat', 'my prescription', 'referral'
    ];
    if (professionalGuidanceKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "I understand you're looking for specific medical advice regarding symptoms, diagnosis, or remedies. However, as an AI, I cannot provide personalized medical diagnoses, prescribe medications, or offer treatment plans. It is crucial to consult with a **qualified doctor or healthcare professional** for proper evaluation, diagnosis, and treatment of any health concerns you may have. They can consider your full medical history and provide appropriate guidance.";
    }

    // --- GENERAL HEALTH INFORMATION (Common Topics) ---

    // Greetings
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good evening') || lowerMessage.includes('namaste')) {
      return `Hello ${user?.name || 'there'}! It's great to hear from you. I can provide general health information and answer common health questions. How can I assist you today?`;
    }

    // Diabetes
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('blood sugar') || lowerMessage.includes('type 1') || lowerMessage.includes('type 2 diabetes') || lowerMessage.includes('insulin') || lowerMessage.includes('glucose levels') || lowerMessage.includes('diabetic diet') || lowerMessage.includes('diabetes management')) {
      return "Diabetes management involves regular monitoring of blood sugar, a balanced diet (low in refined sugars), consistent exercise, and prescribed medications. Emphasize eating regular meals, choosing complex carbohydrates, and monitoring glucose as advised by your doctor. Always work with your healthcare provider for personalized advice.";
    }
    
    // Blood Pressure / Hypertension
    if (lowerMessage.includes('blood pressure') || lowerMessage.includes('hypertension') || lowerMessage.includes('high bp') || lowerMessage.includes('low bp') || lowerMessage.includes('dash diet') || lowerMessage.includes('bp control') || lowerMessage.includes('hypertensive')) {
      return "Managing blood pressure involves lifestyle changes: reducing sodium, maintaining a healthy weight, regular exercise, limiting alcohol, and stress management. The DASH diet is often recommended. Always take prescribed medications as directed by your doctor. Regular check-ups are very important.";
    }
    
    // Headaches / Migraines
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain') || lowerMessage.includes('tension headache') || lowerMessage.includes('cluster headache') || lowerMessage.includes('sinus headache') || lowerMessage.includes('migraine')) {
      return "Headaches have various causes. For relief, try rest in a quiet, dark room, hydrate well, apply a compress, and consider over-the-counter pain relievers if suitable. If headaches are severe, frequent, or have concerning accompanying symptoms, consult a doctor for diagnosis and treatment.";
    }
    
    // Fever
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature') || lowerMessage.includes('high temperature') || lowerMessage.includes('body ache') || lowerMessage.includes('chills') || lowerMessage.includes('flu-like symptoms') || lowerMessage.includes('febrile')) {
      return "Fever indicates your body is fighting infection. Manage it with plenty of rest, hydration, and over-the-counter fever reducers if uncomfortable. Seek medical attention if fever exceeds 103°F (39.4°C), lasts over 3 days, or comes with severe symptoms like difficulty breathing or rash. A doctor can determine the cause.";
    }
    
    // Diet & Nutrition
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('healthy eating') || lowerMessage.includes('balanced diet') || lowerMessage.includes('vitamins') || lowerMessage.includes('minerals') || lowerMessage.includes('food pyramid') || lowerMessage.includes('healthy food') || lowerMessage.includes('nutrient')) {
      return "A balanced diet, rich in fruits, vegetables, whole grains, lean proteins, and healthy fats, is crucial for good health. Focus on portion control and limit processed foods. For personalized dietary advice, especially with health conditions, consulting a registered dietitian or nutritionist is highly recommended.";
    }
    
    // Exercise & Physical Activity
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('physical activity') || lowerMessage.includes('fitness') || lowerMessage.includes('strength training') || lowerMessage.includes('cardio') || lowerMessage.includes('stay active') || lowerMessage.includes('jogging') || lowerMessage.includes('yoga')) {
      return "Regular physical activity is vital for overall health, including heart health, mood, and weight management. Aim for at least 150 minutes of moderate-intensity aerobic activity weekly (e.g., brisk walking) and strength training twice a week. Always consult your doctor before starting new exercise, especially with existing health conditions.";
    }
    
    // Medication Use
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('prescription') || lowerMessage.includes('drug interaction') || lowerMessage.includes('side effects') || lowerMessage.includes('pharmacist') || lowerMessage.includes('taking pills') || lowerMessage.includes('dosages')) {
      return "It's extremely important to take medications exactly as prescribed by your doctor. Never skip doses, stop them without consultation, or share with others. Keep an updated list of all medicines and supplements. Discuss any side effects or concerns with your healthcare team for proper guidance.";
    }
    
    // Stress & Mental Health
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental health') || lowerMessage.includes('depression') || lowerMessage.includes('mindfulness') || lowerMessage.includes('therapy') || lowerMessage.includes('counseling') || lowerMessage.includes('panic attack') || lowerMessage.includes('mood') || lowerMessage.includes('well-being')) {
      return "Managing stress is vital for well-being. Techniques include deep breathing, meditation, yoga, regular sleep, and physical activity. If stress or anxiety significantly impacts your daily life, or if you're experiencing depression symptoms, please talk to a counselor, therapist, or mental health professional. They offer personalized support.";
    }
    
    // Sleep
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('sleep hygiene') || lowerMessage.includes('sleep apnea') || lowerMessage.includes('restless nights') || lowerMessage.includes('tiredness') || lowerMessage.includes('good night\'s sleep')) {
      return "Good sleep hygiene is key for restorative sleep: consistent schedule, comfortable dark environment, avoiding late caffeine/heavy meals, and limiting screen time before bed. Most adults need 7-9 hours. If you consistently struggle, consult a healthcare provider to rule out underlying conditions and get tailored advice.";
    }

    // Cold & Flu
    if (lowerMessage.includes('cold') || lowerMessage.includes('flu') || lowerMessage.includes('cough') || lowerMessage.includes('sore throat') || lowerMessage.includes('runny nose') || lowerMessage.includes('congestion') || lowerMessage.includes('viral infection') || lowerMessage.includes('common cold')) {
        return "For common cold or flu symptoms, rest, stay hydrated, and consider over-the-counter remedies. Wash hands frequently to prevent spread. If symptoms worsen, last longer than a week, or include high fever/difficulty breathing, please consult a doctor. Staying home when sick helps prevent spread in India, especially during seasonal changes.";
    }

    // Allergies
    if (lowerMessage.includes('allergies') || lowerMessage.includes('allergic reaction') || lowerMessage.includes('hay fever') || lowerMessage.includes('pollen') || lowerMessage.includes('hives') || lowerMessage.includes('sneezing') || lowerMessage.includes('itchy eyes') || lowerMessage.includes('allergen')) {
        return "Allergies occur when your immune system reacts to a harmless substance. Management includes avoiding triggers, using antihistamines, nasal sprays, or eye drops. For severe reactions (anaphylaxis), seek immediate emergency care. An allergist can help identify specific allergens and develop a management plan.";
    }

    // Digestion
    if (lowerMessage.includes('digestion') || lowerMessage.includes('stomach ache') || lowerMessage.includes('indigestion') || lowerMessage.includes('heartburn') || lowerMessage.includes('constipation') || lowerMessage.includes('diarrhea') || lowerMessage.includes('bloating') || lowerMessage.includes('acid reflux') || lowerMessage.includes('gut health') || lowerMessage.includes('digestive problems') || lowerMessage.includes('upset stomach')) {
        return "Common digestive issues can often be managed with dietary adjustments like eating smaller, frequent meals, avoiding trigger foods, and staying hydrated. Probiotics might also be beneficial. For persistent or severe symptoms, or blood in stool, please consult a doctor to rule out serious conditions. Be mindful of food hygiene, especially in warm climates.";
    }

    // Back & Joint Pain
    if (lowerMessage.includes('back pain') || lowerMessage.includes('spine') || lowerMessage.includes('posture') || lowerMessage.includes('sciatica') || lowerMessage.includes('lower back pain') || lowerMessage.includes('neck pain') || lowerMessage.includes('joint pain') || lowerMessage.includes('arthritis') || lowerMessage.includes('muscle pain')) {
        return "For general back or joint pain, try applying heat or ice, gentle stretching, and over-the-counter pain relievers. Maintaining good posture and strengthening core muscles can help prevent recurrence. If pain is severe, constant, radiates down your leg, or is accompanied by numbness/weakness, seek medical attention. A physiotherapist might also be helpful.";
    }

    // Skin Health
    if (lowerMessage.includes('skin') || lowerMessage.includes('rash') || lowerMessage.includes('eczema') || lowerMessage.includes('acne') || lowerMessage.includes('psoriasis') || lowerMessage.includes('dermatitis') || lowerMessage.includes('mole') || lowerMessage.includes('skin problem') || lowerMessage.includes('sunburn') || lowerMessage.includes('dermatologist')) {
        return "Skin conditions vary greatly. For general skin health, maintain good hygiene, moisturize regularly, and protect from sun exposure. For persistent rashes, severe acne, or any concerning changes in moles, it's best to consult a dermatologist for proper diagnosis and treatment.";
    }
    
    // Vaccinations & Immunizations
    if (lowerMessage.includes('vaccination') || lowerMessage.includes('immunization') || lowerMessage.includes('shots') || lowerMessage.includes('flu shot') || lowerMessage.includes('booster') || lowerMessage.includes('vaccine schedule') || lowerMessage.includes('polio vaccine') || lowerMessage.includes('covid vaccine') || lowerMessage.includes('preventive shots')) {
        return "Vaccinations are crucial for preventing infectious diseases by building immunity. They protect individuals and communities. Please consult your doctor or local health authority for the recommended vaccination schedule for you and your family, including routine childhood immunizations, flu shots, and boosters relevant to India's public health guidelines.";
    }

    // Smoking Cessation
    if (lowerMessage.includes('smoking cessation') || lowerMessage.includes('quit smoking') || lowerMessage.includes('nicotine') || lowerMessage.includes('vaping') || lowerMessage.includes('tobacco') || lowerMessage.includes('smoking risks')) {
        return "Quitting smoking is one of the best things you can do for your health! It significantly reduces risks of heart disease, cancer, and lung conditions. Support options include nicotine replacement therapy, medications, counseling, and support groups. Your doctor can help you create a personalized quit plan. Many government initiatives in India also support smoking cessation.";
    }

    // Alcohol Moderation
    if (lowerMessage.includes('alcohol moderation') || lowerMessage.includes('reduce alcohol') || lowerMessage.includes('drinking habits') || lowerMessage.includes('alcoholism') || lowerMessage.includes('responsible drinking')) {
        return "Moderate alcohol consumption, if you choose to drink, means up to one drink per day for women and up to two drinks per day for men. Excessive drinking has serious health risks. If you're concerned about your alcohol intake, please talk to a healthcare professional or a support organization for guidance and resources.";
    }

    // Heart Health
    if (lowerMessage.includes('heart health') || lowerMessage.includes('cholesterol') || lowerMessage.includes('cardiac') || lowerMessage.includes('heart disease') || lowerMessage.includes('arrhythmia') || lowerMessage.includes('angina') || lowerMessage.includes('healthy heart') || lowerMessage.includes('cardiovascular') || lowerMessage.includes('heart attack prevention')) {
        return "Maintaining good heart health involves a balanced diet low in saturated and trans fats, regular exercise, managing blood pressure and cholesterol, not smoking, and managing stress. Regular check-ups with your doctor are important to monitor your cardiovascular health, especially given the rising prevalence of heart conditions.";
    }

    // Child Health
    if (lowerMessage.includes('child health') || lowerMessage.includes('pediatric') || lowerMessage.includes('infant health') || lowerMessage.includes('baby health') || lowerMessage.includes('child development') || lowerMessage.includes('immunisation for kids') || lowerMessage.includes('children health')) {
        return "Child health focuses on the physical, mental, and social well-being of infants, children, and adolescents. Key aspects include regular check-ups, vaccinations (as per national immunization schedules), balanced nutrition, age-appropriate physical activity, and ensuring a safe, supportive environment. Always consult a pediatrician for specific concerns about your child's health.";
    }

    // Senior Health
    if (lowerMessage.includes('senior health') || lowerMessage.includes('elderly health') || lowerMessage.includes('geriatric') || lowerMessage.includes('aging') || lowerMessage.includes('mobility') || lowerMessage.includes('senior care') || lowerMessage.includes('health for elderly')) {
        return "Senior health often focuses on maintaining mobility, cognitive function, managing chronic conditions, and staying socially engaged. Regular health screenings, appropriate exercise, a nutrient-rich diet, and staying connected are vital. Consulting with a geriatrics specialist can provide tailored advice for older adults to promote healthy aging.";
    }

    // Hydration
    if (lowerMessage.includes('hydration') || lowerMessage.includes('water intake') || lowerMessage.includes('dehydration') || lowerMessage.includes('thirsty') || lowerMessage.includes('drink water')) {
        return "Staying well-hydrated is crucial for all bodily functions. Aim for at least 8 glasses (about 2 liters) of water daily, but individual needs vary based on activity, climate (especially in India's diverse weather), and health. Drink water throughout the day, even if you don't feel thirsty.";
    }

    // Handwashing & Hygiene
    if (lowerMessage.includes('handwashing') || lowerMessage.includes('hygiene') || lowerMessage.includes('germs') || lowerMessage.includes('sanitizer') || lowerMessage.includes('infection prevention') || lowerMessage.includes('clean hands') || lowerMessage.includes('personal hygiene')) {
        return "Good hand hygiene, especially handwashing with soap and water for at least 20 seconds, is one of the most effective ways to prevent the spread of infections. Do it frequently, especially after coughing, sneezing, using the bathroom, and before eating or preparing food. This is particularly important for public health in crowded areas.";
    }
    
    // Dental Health
    if (lowerMessage.includes('dental health') || lowerMessage.includes('teeth') || lowerMessage.includes('gums') || lowerMessage.includes('cavities') || lowerMessage.includes('brushing') || lowerMessage.includes('flossing') || lowerMessage.includes('oral hygiene') || lowerMessage.includes('dentist') || lowerMessage.includes('toothache')) {
        return "Maintaining good dental health is vital for overall well-being. Brush your teeth twice a day with fluoride toothpaste, floss daily, and limit sugary foods and drinks. Regular dental check-ups and professional cleanings are essential for preventing cavities, gum disease, and other oral health issues.";
    }

    // Eye Health
    if (lowerMessage.includes('eye health') || lowerMessage.includes('vision') || lowerMessage.includes('eyecare') || lowerMessage.includes('glasses') || lowerMessage.includes('contacts') || lowerMessage.includes('cataracts') || lowerMessage.includes('glaucoma') || lowerMessage.includes('eye strain') || lowerMessage.includes('optician') || lowerMessage.includes('ophthalmologist')) {
        return "Protecting your eye health involves regular eye exams, wearing sunglasses to block UV rays, eating a diet rich in eye-friendly nutrients, and taking breaks from screens (the 20-20-20 rule). If you experience sudden vision changes, pain, or redness, consult an eye care professional immediately.";
    }

    // Asthma
    if (lowerMessage.includes('asthma') || lowerMessage.includes('breathing difficulty') || lowerMessage.includes('wheezing') || lowerMessage.includes('inhaler') || lowerMessage.includes('asthma attack') || lowerMessage.includes('respiratory problems')) {
        return "Asthma is a chronic respiratory condition where airways narrow and swell. Triggers include allergens, exercise, cold air, or stress. Management often involves quick-relief inhalers and long-term control medications. It's crucial to work with a doctor to develop a personalized asthma action plan and identify your specific triggers.";
    }

    // Thyroid
    if (lowerMessage.includes('thyroid') || lowerMessage.includes('hypothyroidism') || lowerMessage.includes('hyperthyroidism') || lowerMessage.includes('thyroid hormones') || lowerMessage.includes('goiter') || lowerMessage.includes('thyroid issues') || lowerMessage.includes('endocrinologist')) {
        return "Thyroid disorders affect your metabolism. Hypothyroidism (underactive) can cause fatigue, weight gain, cold sensitivity. Hyperthyroidism (overactive) can lead to weight loss, anxiety, heart palpitations. Both are diagnosed with blood tests. Treatment typically involves medication to balance hormones. If symptoms appear, consult an endocrinologist.";
    }
    
    // Infectious Diseases Common in India (General Advice)
    if (lowerMessage.includes('malaria') || lowerMessage.includes('dengue') || lowerMessage.includes('chikungunya') || lowerMessage.includes('mosquito-borne diseases') || lowerMessage.includes('typhoid') || lowerMessage.includes('cholera') || lowerMessage.includes('viral fever') || lowerMessage.includes('diarrheal diseases')) {
        return "Diseases like Malaria, Dengue, Chikungunya, Typhoid, and Cholera are prevalent in certain regions. Prevention is key: protect yourself from mosquito bites, ensure safe drinking water, practice good food hygiene, and wash hands frequently. If you experience fever, body aches, rash, or severe headache, seek immediate medical attention from a doctor for diagnosis and treatment.";
    }
    
    // Tuberculosis (TB)
    if (lowerMessage.includes('tuberculosis') || lowerMessage.includes('tb') || lowerMessage.includes('coughing blood') || lowerMessage.includes('night sweats')) {
        return "Tuberculosis (TB) is a serious bacterial infection primarily affecting the lungs, and it's a significant public health concern. Symptoms include persistent cough (sometimes with blood), fever, night sweats, and weight loss. Early diagnosis and a full course of prescribed medication are crucial for successful treatment and preventing spread. If you suspect TB, please consult a doctor immediately and complete the entire treatment course as advised by national health programs.";
    }

    // Public Health & Sanitation (India-specific context)
    if (lowerMessage.includes('hygiene in india') || lowerMessage.includes('sanitation') || lowerMessage.includes('swachh bharat') || lowerMessage.includes('public health')) {
        return "Good hygiene and sanitation practices are vital for public health in India. This includes regular handwashing, safe disposal of waste, access to clean drinking water, and maintaining cleanliness in public and private spaces. These practices help prevent the spread of many infectious diseases. Initiatives like Swachh Bharat Abhiyan promote these habits.";
    }

    // Health Schemes in India
    if (lowerMessage.includes('public health schemes in india') || lowerMessage.includes('ayushman bharat') || lowerMessage.includes('pmjay') || lowerMessage.includes('health insurance india') || lowerMessage.includes('government health schemes')) {
        return "India has several public health schemes aimed at providing accessible healthcare. **Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)** is a major government-sponsored health insurance scheme providing financial coverage for hospitalization for eligible beneficiaries. Other initiatives focus on primary healthcare, maternal and child health, and disease control. You can check official government health portals for more details on eligibility and benefits.";
    }

    // --- DEFAULT RESPONSES ---
    // Fallback responses if no specific rule is matched.
    const defaultResponses = [
      "I can provide general health information. For specific medical concerns, please consult a qualified healthcare professional who can offer personalized advice based on your medical history and individual needs.",
      "Thank you for your question. For accurate and personalized medical advice, it is always best to consult with a doctor or a healthcare provider who can properly evaluate your situation.",
      "As Dr. MediBot, I offer general health knowledge. If you're experiencing symptoms or have specific health worries, please speak directly with your doctor for the safest and most appropriate guidance.",
      "Health matters are complex and unique to each individual. While I can share general insights, your healthcare provider is the best person to address your specific health concerns, diagnose conditions, and recommend appropriate treatment strategies. For medical emergencies, please call **108**.",
      "Remember, I am an AI assistant providing general health information, not a medical professional. Always verify any health information with a qualified doctor, especially for India-specific health advice."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }, [user]); // `user` is a dependency because the greeting uses `user?.name`

  /**
   * Handles sending a message: adds user message to chat, then generates and adds bot response.
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return; // Prevent sending empty messages

    // 1. Add user's message to the chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(), // Unique ID for the message
      message: inputMessage,
      isBot: false, // Indicates it's a user message
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]); // Update state with new message
    setInputMessage(''); // Clear the input field
    setIsTyping(true); // Show typing indicator

    try {
      // 2. Generate bot's response
      const botResponse = await generateBotResponse(userMessage.message);

      // 3. Add bot's response to the chat
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(), // Unique ID for bot message
        message: botResponse,
        isBot: true, // Indicates it's a bot message
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]); // Update state with bot's message
    } catch (error) {
      console.error('Failed to generate response:', error);
      // Fallback error message if bot response generation fails
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "I apologize, but I'm having trouble responding right now. Please try again or consult with a healthcare professional for your health concerns.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false); // Hide typing indicator
    }
  };

  /**
   * Handles keyboard press events for the input field.
   * Sends message on 'Enter' key press (without Shift).
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line in textarea
      handleSendMessage();
    }
  };

  /**
   * Clears all messages in the chat and resets to the initial greeting.
   */
  const clearChat = () => {
    setMessages([
      {
        id: '1',
        message: `Hello ${user?.name || 'there'}! I'm Dr. MediBot, your AI health assistant. I'm here to help answer your **general health-related questions** and provide **basic medical information**. How can I assist you today? **Remember, I am not a substitute for a doctor.**`,
        isBot: true,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Chat Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dr. MediBot</h1>
            <p className="text-gray-600">Your AI health assistant for general health questions</p>
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
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col">
        {/* Messages Display Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isBot ? 'bg-blue-100' : 'bg-blue-600 text-white' // User avatar color changed for distinction
                }`}>
                  {message.isBot ? (
                    <Bot className="h-5 w-5 text-blue-600" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`rounded-lg p-4 ${
                  message.isBot 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <p className="text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: message.message }}></p>
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
          
          <div ref={messagesEndRef} /> {/* Reference for auto-scrolling */}
        </div>

        {/* Message Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about general health topics or common questions..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              disabled={isTyping} // Disable input when bot is typing
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping} // Disable send button if input is empty or bot is typing
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>
          
          {/* Medical Disclaimer */}
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Medical Disclaimer:</strong> Dr. MediBot provides **general health information only** and is **not a substitute for professional medical advice, diagnosis, or treatment.** Always consult **qualified healthcare providers (e.g., your doctor or an emergency service like 108 in India)** for any medical concerns, symptoms, or before making any decisions about your health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediBot;