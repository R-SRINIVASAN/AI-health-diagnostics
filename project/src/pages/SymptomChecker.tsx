import React, { useState } from 'react';
import { Stethoscope, AlertTriangle, CheckCircle, Download, Clock, User, Brain, Heart, Activity, Thermometer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SymptomAnalysis } from '../types';
import { PDFExportUtil } from '../utils/pdfExport';

const SymptomChecker: React.FC = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [history, setHistory] = useState<SymptomAnalysis[]>([]);

  // Enhanced AI analysis function with deeper medical knowledge
  const analyzeSymptoms = async (
    symptomText: string, 
    duration: string, 
    severity: string, 
    additionalInfo: string
  ): Promise<SymptomAnalysis> => {
    // Simulate comprehensive AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const lowerSymptoms = symptomText.toLowerCase();
    const userAge = user?.age || 30;
    const userGender = user?.gender || 'unknown';
    const userConditions = user?.diseases || [];
    const userMedications = user?.medications || [];
    
    let diagnosis: string[] = [];
    let recommendation = '';
    let urgency: 'low' | 'medium' | 'high' = 'low';
    let detailedAnalysis = '';
    let riskFactors: string[] = [];
    let followUpActions: string[] = [];

    // Comprehensive symptom analysis based on multiple factors
    if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('chest pressure') || lowerSymptoms.includes('heart pain')) {
      if (severity === 'severe' || lowerSymptoms.includes('crushing') || lowerSymptoms.includes('radiating')) {
        diagnosis = ['Acute Coronary Syndrome', 'Myocardial Infarction', 'Unstable Angina', 'Pulmonary Embolism'];
        urgency = 'high';
        recommendation = '🚨 IMMEDIATE MEDICAL EMERGENCY: Call 911 or go to the nearest emergency room immediately. Do not drive yourself.';
        detailedAnalysis = `Severe chest pain, especially with your profile (Age: ${userAge}, Gender: ${userGender}), requires immediate evaluation to rule out heart attack or other life-threatening conditions. The combination of symptoms and severity indicates potential cardiac emergency.`;
        riskFactors = userAge > 45 ? ['Age over 45', 'Potential cardiac risk'] : ['Chest pain severity'];
        followUpActions = ['Emergency room evaluation', 'ECG and cardiac enzymes', 'Immediate cardiology consultation'];
      } else {
        diagnosis = ['Costochondritis', 'Muscle Strain', 'Anxiety-related Chest Pain', 'GERD'];
        urgency = 'medium';
        recommendation = 'Monitor symptoms closely. If pain worsens, becomes crushing, or radiates to arm/jaw, seek immediate medical attention.';
        detailedAnalysis = `Mild to moderate chest pain can have various causes. Given the duration of ${duration} and ${severity} severity, muscular or inflammatory causes are more likely, but cardiac causes should still be evaluated.`;
        riskFactors = ['Stress', 'Physical activity', 'Posture-related factors'];
        followUpActions = ['Schedule appointment with primary care physician', 'Monitor for worsening symptoms', 'Consider stress management'];
      }
    } 
    else if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('head pain')) {
      if (lowerSymptoms.includes('sudden') || lowerSymptoms.includes('worst headache') || severity === 'severe') {
        diagnosis = ['Subarachnoid Hemorrhage', 'Meningitis', 'Severe Migraine', 'Cluster Headache'];
        urgency = 'high';
        recommendation = 'Sudden severe headache ("worst headache of life") requires immediate emergency evaluation to rule out bleeding in the brain.';
        detailedAnalysis = `Sudden onset severe headache is a red flag symptom that requires immediate evaluation. The pattern and severity suggest potential intracranial pathology that needs urgent assessment.`;
        riskFactors = ['Sudden onset', 'Severity', 'Age factors'];
        followUpActions = ['Emergency room evaluation', 'CT scan or MRI', 'Neurological examination'];
      } else {
        diagnosis = ['Tension Headache', 'Migraine', 'Dehydration', 'Sinus Headache', 'Medication Overuse Headache'];
        urgency = 'low';
        recommendation = 'Rest in quiet, dark room. Stay hydrated. Consider over-the-counter pain relief. Track triggers and patterns.';
        detailedAnalysis = `Based on the ${duration} duration and ${severity} severity, this appears to be a primary headache disorder. Your age (${userAge}) and symptom pattern suggest tension-type headache or migraine as most likely causes.`;
        riskFactors = ['Stress', 'Dehydration', 'Sleep patterns', 'Screen time'];
        followUpActions = ['Maintain headache diary', 'Identify triggers', 'Consider lifestyle modifications', 'Follow up if frequent'];
      }
    }
    else if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('temperature') || lowerSymptoms.includes('chills')) {
      const hasCough = lowerSymptoms.includes('cough');
      const hasBreathing = lowerSymptoms.includes('breathing') || lowerSymptoms.includes('shortness');
      
      if (severity === 'severe' || hasBreathing) {
        diagnosis = ['Pneumonia', 'Sepsis', 'COVID-19', 'Influenza', 'Bacterial Infection'];
        urgency = 'high';
        recommendation = 'High fever with breathing difficulties requires immediate medical evaluation. Seek emergency care if temperature >103°F or breathing becomes difficult.';
        detailedAnalysis = `Fever with respiratory symptoms in your age group (${userAge}) requires careful evaluation for pneumonia or other serious infections. The combination of symptoms suggests potential lower respiratory tract involvement.`;
        riskFactors = userConditions.length > 0 ? ['Existing medical conditions', 'Age factors', 'Immune status'] : ['Infection severity', 'Respiratory involvement'];
        followUpActions = ['Immediate medical evaluation', 'Chest X-ray', 'Blood tests', 'Possible hospitalization'];
      } else {
        diagnosis = ['Viral Upper Respiratory Infection', 'Common Cold', 'Flu', 'Gastroenteritis'];
        urgency = 'low';
        recommendation = 'Rest, increase fluid intake, monitor temperature. Seek care if fever persists >3 days or exceeds 103°F.';
        detailedAnalysis = `Mild fever of ${duration} duration suggests viral illness. Your overall health profile indicates good prognosis with supportive care. Monitor for complications.`;
        riskFactors = ['Viral exposure', 'Seasonal factors', 'Immune status'];
        followUpActions = ['Symptomatic treatment', 'Rest and hydration', 'Monitor progression', 'Isolate if contagious'];
      }
    }
    else if (lowerSymptoms.includes('abdominal pain') || lowerSymptoms.includes('stomach pain') || lowerSymptoms.includes('belly pain')) {
      const hasVomiting = lowerSymptoms.includes('vomiting') || lowerSymptoms.includes('nausea');
      const location = lowerSymptoms.includes('right') ? 'right' : lowerSymptoms.includes('left') ? 'left' : 'general';
      
      if (severity === 'severe' || (location === 'right' && lowerSymptoms.includes('lower'))) {
        diagnosis = ['Appendicitis', 'Gallbladder Disease', 'Bowel Obstruction', 'Kidney Stones'];
        urgency = 'high';
        recommendation = 'Severe abdominal pain, especially in right lower quadrant, requires immediate surgical evaluation. Do not eat or drink until evaluated.';
        detailedAnalysis = `Severe abdominal pain with ${duration} duration and ${location} location raises concern for surgical conditions. Your age (${userAge}) and symptom pattern require urgent evaluation to rule out appendicitis or other surgical emergencies.`;
        riskFactors = ['Location of pain', 'Severity', 'Associated symptoms'];
        followUpActions = ['Emergency surgical consultation', 'CT scan', 'Blood tests', 'NPO (nothing by mouth)'];
      } else {
        diagnosis = ['Gastroenteritis', 'Food Poisoning', 'IBS', 'Acid Reflux', 'Muscle Strain'];
        urgency = 'low';
        recommendation = 'Mild abdominal discomfort can be managed with rest, clear fluids, and bland diet. Monitor for worsening.';
        detailedAnalysis = `Mild abdominal symptoms of ${duration} duration are commonly caused by dietary factors or minor gastrointestinal upset. Your symptom pattern suggests non-urgent causes.`;
        riskFactors = ['Dietary factors', 'Stress', 'Recent food intake'];
        followUpActions = ['Dietary modifications', 'Symptom monitoring', 'Gradual return to normal diet'];
      }
    }
    else if (lowerSymptoms.includes('shortness of breath') || lowerSymptoms.includes('breathing') || lowerSymptoms.includes('dyspnea')) {
      diagnosis = ['Asthma Exacerbation', 'Pneumonia', 'Pulmonary Embolism', 'Heart Failure', 'Anxiety'];
      urgency = 'high';
      recommendation = 'Breathing difficulties require immediate medical evaluation. Call 911 if severe or worsening rapidly.';
      detailedAnalysis = `Shortness of breath in your age group (${userAge}) requires careful evaluation for cardiac or pulmonary causes. The ${duration} duration and associated symptoms need immediate assessment.`;
      riskFactors = userConditions.includes('Asthma') ? ['Known asthma', 'Trigger exposure'] : ['New onset dyspnea', 'Age factors'];
      followUpActions = ['Emergency evaluation', 'Chest X-ray', 'ECG', 'Oxygen saturation monitoring'];
    }
    else if (lowerSymptoms.includes('dizziness') || lowerSymptoms.includes('lightheaded') || lowerSymptoms.includes('vertigo')) {
      diagnosis = ['Benign Positional Vertigo', 'Inner Ear Infection', 'Dehydration', 'Medication Side Effect', 'Orthostatic Hypotension'];
      urgency = 'low';
      recommendation = 'Avoid sudden movements, stay hydrated. If associated with chest pain or severe headache, seek immediate care.';
      detailedAnalysis = `Dizziness of ${duration} duration can have multiple causes. Your medication list and medical history should be reviewed for potential contributing factors.`;
      riskFactors = userMedications.length > 0 ? ['Current medications', 'Dehydration', 'Position changes'] : ['Dehydration', 'Inner ear factors'];
      followUpActions = ['Review medications', 'Hydration assessment', 'Blood pressure monitoring', 'ENT evaluation if persistent'];
    }
    else {
      // General symptom analysis
      diagnosis = ['Viral Syndrome', 'Stress-related Symptoms', 'Lifestyle Factors', 'Minor Illness'];
      urgency = 'low';
      recommendation = 'Monitor symptoms and maintain good self-care. Consult healthcare provider if symptoms persist or worsen.';
      detailedAnalysis = `Your symptoms of ${duration} duration with ${severity} severity appear to be consistent with common, non-urgent conditions. However, given your individual health profile, monitoring is recommended.`;
      riskFactors = ['General health factors', 'Lifestyle considerations'];
      followUpActions = ['Symptom monitoring', 'Self-care measures', 'Follow-up if needed'];
    }

    // Consider user's existing conditions
    if (userConditions.length > 0) {
      riskFactors.push(`Existing conditions: ${userConditions.join(', ')}`);
      detailedAnalysis += ` Your existing medical conditions (${userConditions.join(', ')}) may influence symptom presentation and require modified management approach.`;
    }

    return {
      id: Date.now().toString(),
      userId: user?.id || '1',
      symptoms: symptomText,
      duration,
      severity,
      additionalInfo,
      diagnosis,
      recommendation,
      urgency,
      detailedAnalysis,
      riskFactors,
      followUpActions,
      timestamp: new Date()
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptoms(symptoms, duration, severity, additionalInfo);
      setAnalysis(result);
      setHistory(prev => [result, ...prev]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    
    try {
      await PDFExportUtil.generateReportPDF({
        'Patient Name': user?.name,
        'Date': analysis.timestamp.toLocaleString(),
        'Symptoms Reported': analysis.symptoms,
        'Duration': analysis.duration,
        'Severity': analysis.severity,
        'Additional Information': analysis.additionalInfo,
        'Possible Diagnoses': analysis.diagnosis.join(', '),
        'Detailed Analysis': analysis.detailedAnalysis,
        'Risk Factors': analysis.riskFactors?.join(', ') || 'None identified',
        'Recommendations': analysis.recommendation,
        'Follow-up Actions': analysis.followUpActions?.join(', ') || 'Standard monitoring',
        'Urgency Level': analysis.urgency.toUpperCase(),
        'Disclaimer': 'This is an AI-generated analysis for informational purposes only. Always consult with a qualified healthcare professional for proper medical diagnosis and treatment.'
      }, 'Comprehensive Symptom Analysis');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-green-600 bg-green-100 border-green-300';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="h-6 w-6" />;
      case 'medium': return <Clock className="h-6 w-6" />;
      default: return <CheckCircle className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Symptom Checker
              </h1>
              <p className="text-xl text-gray-600 mt-2">Advanced medical AI for comprehensive symptom analysis</p>
            </div>
          </div>
        </div>

        {/* Enhanced Disclaimer */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 text-lg">Medical Disclaimer</h3>
              <p className="text-yellow-700 mt-2 leading-relaxed">
                This AI tool provides comprehensive health information and analysis but is not a substitute for professional medical advice, diagnosis, or treatment. 
                Always consult with qualified healthcare providers for medical concerns, especially for urgent symptoms.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Symptom Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Comprehensive Symptom Assessment</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-semibold text-gray-700 mb-3">
                    Primary Symptoms *
                  </label>
                  <textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    placeholder="Describe your symptoms in detail. Include location, quality, and any patterns you've noticed. For example: 'Sharp chest pain on the left side that worsens with deep breathing, started 2 hours ago after exercise.'"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-3">
                      Duration *
                    </label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select duration</option>
                      <option value="less than 1 hour">Less than 1 hour</option>
                      <option value="1-6 hours">1-6 hours</option>
                      <option value="6-24 hours">6-24 hours</option>
                      <option value="1-3 days">1-3 days</option>
                      <option value="3-7 days">3-7 days</option>
                      <option value="1-4 weeks">1-4 weeks</option>
                      <option value="more than 1 month">More than 1 month</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="severity" className="block text-sm font-semibold text-gray-700 mb-3">
                      Severity Level *
                    </label>
                    <select
                      id="severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select severity</option>
                      <option value="mild">Mild (1-3/10) - Barely noticeable</option>
                      <option value="moderate">Moderate (4-6/10) - Interferes with activities</option>
                      <option value="severe">Severe (7-10/10) - Debilitating</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-semibold text-gray-700 mb-3">
                    Additional Information
                  </label>
                  <textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="w-full h-24 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    placeholder="Any triggers, associated symptoms, medications taken, or other relevant information..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isAnalyzing || !symptoms.trim() || !duration || !severity}
                  className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="font-semibold">Analyzing Symptoms...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5" />
                      <span className="font-semibold">Analyze Symptoms with AI</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Enhanced Analysis Results */}
            {analysis && (
              <div id="symptom-analysis-result" className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Comprehensive Analysis Results</h2>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Download className="h-5 w-5" />
                    <span className="font-semibold">Download Report</span>
                  </button>
                </div>

                {/* Urgency Level */}
                <div className={`flex items-center space-x-4 p-6 rounded-xl mb-8 border-2 ${getUrgencyColor(analysis.urgency)} shadow-lg`}>
                  {getUrgencyIcon(analysis.urgency)}
                  <div>
                    <span className="font-bold text-lg">
                      Urgency Level: {analysis.urgency.charAt(0).toUpperCase() + analysis.urgency.slice(1)}
                    </span>
                    {analysis.urgency === 'high' && (
                      <p className="text-sm mt-1 font-medium">Immediate medical attention recommended</p>
                    )}
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                    <Heart className="h-6 w-6 text-red-500 mr-2" />
                    Clinical Analysis
                  </h3>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-gray-800 leading-relaxed">{analysis.detailedAnalysis}</p>
                  </div>
                </div>

                {/* Possible Diagnoses */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Possible Conditions (Differential Diagnosis):</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.diagnosis.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-blue-800 font-medium">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                      Risk Factors
                    </h3>
                    <div className="space-y-2">
                      {analysis.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-yellow-800">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                    <Thermometer className="h-6 w-6 text-green-500 mr-2" />
                    Recommendations
                  </h3>
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <p className="text-green-800 leading-relaxed font-medium">{analysis.recommendation}</p>
                  </div>
                </div>

                {/* Follow-up Actions */}
                {analysis.followUpActions && analysis.followUpActions.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Recommended Follow-up Actions:</h3>
                    <div className="space-y-3">
                      {analysis.followUpActions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <span className="text-gray-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-sm text-gray-500 text-center pt-6 border-t border-gray-200">
                  Analysis completed on {analysis.timestamp.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced History Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                Recent Analysis History
              </h2>
              
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No previous analyses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="border-2 border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getUrgencyColor(item.urgency)}`}>
                          {item.urgency.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {item.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3 leading-relaxed">
                        {item.symptoms.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-600 font-semibold">
                          {item.diagnosis[0]}
                        </p>
                        <span className="text-xs text-gray-400">
                          {item.duration} • {item.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Quick Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border border-purple-100">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <Brain className="h-6 w-6 text-purple-600 mr-2" />
                Tips for Accurate Analysis
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Be specific about symptom location and quality</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Include timing, triggers, and aggravating factors</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Mention any associated symptoms</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Rate severity on a scale of 1-10</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Include relevant medical history</span>
                </li>
              </ul>
            </div>

            {/* Emergency Contact Info */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-6 border border-red-200">
              <h3 className="font-bold text-red-800 mb-3 text-lg flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                Emergency Contacts
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-red-700"><strong>Emergency:</strong> 911</p>
                <p className="text-red-700"><strong>Poison Control:</strong> 1-800-222-1222</p>
                <p className="text-red-700"><strong>Crisis Hotline:</strong> 988</p>
                {user?.emergencyContact && (
                  <p className="text-red-700"><strong>Your Emergency Contact:</strong> {user.emergencyContact}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;