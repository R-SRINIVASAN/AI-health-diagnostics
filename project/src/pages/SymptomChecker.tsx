import React, { useState, useEffect, useCallback } from 'react';
import { Stethoscope, AlertTriangle, CheckCircle, Download, Clock, User, Brain, Heart, Activity, Thermometer, FlaskConical, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SymptomAnalysis } from '../types';
import { PDFExportUtil } from '../utils/pdfExport';

// Placeholder for a more advanced AI model or API call
// In a real-world scenario, this would interact with a backend AI service
const fetchAIAnalysis = async (payload: {
  symptoms: string;
  duration: string;
  severity: string;
  userProfile: {
    age: number;
    gender: string;
    conditions: string[];
    medications: string[];
  };
  additionalInfo: string;
}): Promise<SymptomAnalysis | null> => {
  // Simulate API call to a sophisticated AI model (e.g., LLM, trained medical AI)
  console.log('Sending data to AI for advanced analysis:', payload);

  await new Promise(resolve => setTimeout(resolve, 3500)); // Simulate network delay

  // This is where a real AI would process the input and return a structured analysis.
  // For demonstration, we'll use a more complex set of rules and generate a plausible output.
  const { symptoms, duration, severity, userProfile, additionalInfo } = payload;
  const lowerSymptoms = symptoms.toLowerCase();
  const userAge = userProfile.age;
  const userGender = userProfile.gender;
  const userConditions = userProfile.conditions;
  const userMedications = userProfile.medications;

  let diagnosis: string[] = [];
  let recommendation = '';
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let detailedAnalysis = '';
  let riskFactors: string[] = [];
  let followUpActions: string[] = [];
  let probableCauses: string[] = [];
  let differentialDiagnoses: { condition: string; likelihood: string; description: string }[] = [];
  let redFlagSymptoms: string[] = [];

  // --- Advanced Rule-Based & Pattern Matching (simulating AI complexity) ---

  // Critical Symptoms - High Urgency
  if (
    (lowerSymptoms.includes('sudden chest pain') && lowerSymptoms.includes('radiating to arm')) ||
    (lowerSymptoms.includes('difficulty breathing') && lowerSymptoms.includes('blue lips')) ||
    (lowerSymptoms.includes('sudden weakness on one side')) ||
    (lowerSymptoms.includes('loss of consciousness')) ||
    (lowerSymptoms.includes('severe abdominal pain') && (lowerSymptoms.includes('rigid belly') || lowerSymptoms.includes('rebound tenderness'))) ||
    (lowerSymptoms.includes('worst headache of life') && lowerSymptoms.includes('stiff neck'))
  ) {
    diagnosis = ['Medical Emergency (e.g., MI, Stroke, Aneurysm, Sepsis)'];
    urgency = 'high';
    recommendation = '🚨 IMMEDIATE EMERGENCY MEDICAL ATTENTION REQUIRED. Call emergency services (911/112/108) or go to the nearest emergency room immediately. Do not delay.';
    detailedAnalysis = 'Your reported symptoms indicate a potential life-threatening condition requiring urgent medical intervention. Time is critical for diagnosis and treatment. Emergency services can provide immediate assessment and transport.';
    riskFactors.push('Rapid onset', 'Severe vital sign implications');
    followUpActions.push('Emergency transport to hospital', 'Immediate clinical assessment', 'Advanced diagnostic imaging (CT/MRI)');
    redFlagSymptoms.push(...lowerSymptoms.split(' ').filter(s => ['sudden', 'severe', 'worst', 'loss', 'blue', 'rigid', 'radiating', 'stiff'].includes(s)));
  }
  // Chest Pain Scenarios (refined)
  else if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('chest pressure')) {
    if (severity === 'severe' || duration === 'less than 1 hour' || lowerSymptoms.includes('crushing') || lowerSymptoms.includes('radiating to arm') || lowerSymptoms.includes('jaw')) {
      diagnosis = ['Acute Coronary Syndrome', 'Myocardial Infarction', 'Pulmonary Embolism'];
      urgency = 'high';
      recommendation = 'Seek immediate emergency medical evaluation for severe or radiating chest pain. This could indicate a cardiac event or other serious conditions.';
      detailedAnalysis = `Given the severity (${severity}) and nature (e.g., crushing, radiating) of your chest pain, combined with your profile (Age: ${userAge}, Gender: ${userGender}${userConditions.length > 0 ? ', Existing Conditions: ' + userConditions.join(', ') : ''}), a high index of suspicion for acute cardiac or pulmonary emergencies is warranted.`;
      riskFactors.push('Cardiovascular risk factors (if applicable to user profile)', 'Sudden onset', 'Exertion-related', ...(userAge > 45 && userGender === 'male' ? ['Increased cardiac risk for males over 45'] : []), ...(userConditions.includes('Hypertension') || userConditions.includes('Diabetes') ? ['Co-morbidities'] : []));
      followUpActions.push('Emergency room evaluation', 'ECG and cardiac enzyme tests', 'Cardiology consultation');
      differentialDiagnoses.push(
        { condition: 'Myocardial Infarction', likelihood: 'High (if symptoms are classic)', description: 'Heart attack due to blocked coronary artery.' },
        { condition: 'Pulmonary Embolism', likelihood: 'Medium-High (if shortness of breath/leg pain)', description: 'Blood clot in lung artery.' },
        { condition: 'Aortic Dissection', likelihood: 'Low (but critical if present)', description: 'Tear in the aorta, causes ripping pain.' }
      );
      redFlagSymptoms.push('crushing pain', 'radiating pain', 'shortness of breath with chest pain');
    } else if (lowerSymptoms.includes('sharp') && lowerSymptoms.includes('worsens with breathing')) {
      diagnosis = ['Pleurisy', 'Costochondritis', 'Pericarditis'];
      urgency = 'medium';
      recommendation = 'Consult with a doctor within 24-48 hours. Monitor for worsening symptoms or development of fever/shortness of breath.';
      detailedAnalysis = `Sharp chest pain aggravated by breathing suggests inflammation of the lung lining (pleurisy) or chest wall cartilage (costochondritis). While less immediately life-threatening than cardiac causes, evaluation is recommended.`;
      riskFactors.push('Recent viral infection', 'Physical exertion');
      followUpActions.push('GP appointment', 'Anti-inflammatory medications', 'Rest');
      differentialDiagnoses.push(
        { condition: 'Pleurisy', likelihood: 'High', description: 'Inflammation of lung lining.' },
        { condition: 'Costochondritis', likelihood: 'High', description: 'Inflammation of chest cartilage.' },
        { condition: 'GERD', likelihood: 'Medium', description: 'Heartburn can mimic chest pain.' }
      );
    } else {
      diagnosis = ['Muscle Strain', 'GERD', 'Anxiety', 'Indigestion'];
      urgency = 'low';
      recommendation = 'Monitor symptoms, consider antacids for indigestion. If pain persists or new symptoms develop, see a doctor.';
      detailedAnalysis = `Non-specific chest pain, particularly if intermittent or mild, is often musculoskeletal or gastrointestinal in origin. Your general profile suggests these are more likely.`;
      riskFactors.push('Stress', 'Dietary factors', 'Physical activity');
      followUpActions.push('Lifestyle modifications', 'Over-the-counter remedies');
    }
  }
  // Headache Scenarios (refined)
  else if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('head pain')) {
    if (lowerSymptoms.includes('sudden') && severity === 'severe' || lowerSymptoms.includes('worst headache of life') || lowerSymptoms.includes('fever') && lowerSymptoms.includes('stiff neck')) {
      diagnosis = ['Subarachnoid Hemorrhage', 'Meningitis', 'Brain Tumor (less likely acute)'];
      urgency = 'high';
      recommendation = 'Seek immediate emergency medical evaluation for sudden, severe headache, especially with fever or stiff neck. These are red flags for serious neurological conditions.';
      detailedAnalysis = `The description of your headache (sudden onset, severe, associated with ${lowerSymptoms.includes('fever') ? 'fever' : ''}${lowerSymptoms.includes('stiff neck') ? ' and stiff neck' : ''}) is highly concerning for intracranial pathology requiring urgent imaging and neurological assessment.`;
      riskFactors.push('Sudden onset', 'Associated neurological deficits', 'Systemic symptoms');
      followUpActions.push('Emergency room evaluation', 'CT scan/MRI of brain', 'Lumbar puncture (if meningitis suspected)');
      differentialDiagnoses.push(
        { condition: 'Subarachnoid Hemorrhage', likelihood: 'High (if "thunderclap" headache)', description: 'Bleeding around the brain.' },
        { condition: 'Meningitis', likelihood: 'High (if fever, stiff neck, altered mental status)', description: 'Inflammation of brain membranes.' },
        { condition: 'Giant Cell Arteritis', likelihood: 'Medium (if over 50, jaw pain)', description: 'Inflammation of blood vessels.' }
      );
      redFlagSymptoms.push('sudden onset', 'thunderclap headache', 'stiff neck', 'fever with headache', 'visual changes');
    } else if (lowerSymptoms.includes('throbbing') && lowerSymptoms.includes('light sensitivity') || lowerSymptoms.includes('aura')) {
      diagnosis = ['Migraine with Aura', 'Migraine without Aura'];
      urgency = 'medium';
      recommendation = 'Consult your doctor for migraine management strategies. Avoid triggers and consider prescription medications if over-the-counter options are insufficient.';
      detailedAnalysis = `Your symptoms strongly align with a migraine headache, characterized by throbbing pain, light sensitivity, and possible auras. Effective management often involves identifying and avoiding triggers, and specific medications.`;
      riskFactors.push('Family history of migraines', 'Stress', 'Certain foods', 'Hormonal changes');
      followUpActions.push('Neurologist consultation', 'Migraine diary', 'Prophylactic medications');
      differentialDiagnoses.push(
        { condition: 'Migraine', likelihood: 'High', description: 'Neurological disorder causing severe headaches.' },
        { condition: 'Cluster Headache', likelihood: 'Low (but distinct pattern)', description: 'Severe pain behind one eye, often with tearing/nasal congestion.' }
      );
    } else {
      diagnosis = ['Tension Headache', 'Dehydration', 'Sinus Headache', 'Eyestrain'];
      urgency = 'low';
      recommendation = 'Rest, stay hydrated, manage stress, and consider over-the-counter pain relievers. If headaches become frequent or severe, see a doctor.';
      detailedAnalysis = `Common causes like tension, dehydration, or sinus issues are likely given the non-specific nature of your headache and its ${duration} duration.`;
      riskFactors.push('Stress', 'Lack of sleep', 'Dehydration', 'Poor posture');
      followUpActions.push('Lifestyle modifications', 'Pain management strategies');
    }
  }
  // Fever Scenarios (refined)
  else if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('temperature') || lowerSymptoms.includes('chills')) {
    const hasCough = lowerSymptoms.includes('cough');
    const hasBreathing = lowerSymptoms.includes('breathing difficulty') || lowerSymptoms.includes('shortness of breath');
    const hasRash = lowerSymptoms.includes('rash');
    const hasStiffNeck = lowerSymptoms.includes('stiff neck');

    if (severity === 'severe' && (hasBreathing || hasStiffNeck || hasRash)) {
      diagnosis = ['Sepsis', 'Pneumonia', 'Meningitis', 'Severe Viral Infection (e.g., severe COVID-19, Dengue)'];
      urgency = 'high';
      recommendation = 'High fever with severe symptoms like difficulty breathing, rash, or stiff neck indicates a serious infection. Seek immediate emergency medical care.';
      detailedAnalysis = `Your high fever combined with alarming symptoms such as ${hasBreathing ? 'breathing difficulties' : ''}${hasStiffNeck ? ' and stiff neck' : ''}${hasRash ? ' and rash' : ''} necessitates urgent medical evaluation to rule out life-threatening infections. Your existing conditions (${userConditions.join(', ')}) may increase susceptibility.`;
      riskFactors.push('Immunocompromised state (if applicable)', 'Age extremes', 'Recent travel (if applicable)', 'Co-morbidities');
      followUpActions.push('Emergency room evaluation', 'Blood cultures', 'Chest X-ray', 'Lumbar puncture (if meningitis suspected)', 'Hospital admission');
      redFlagSymptoms.push('high fever', 'difficulty breathing', 'rash with fever', 'stiff neck with fever', 'altered mental status');
    } else if (hasCough || hasBreathing) {
      diagnosis = ['Bronchitis', 'Influenza', 'COVID-19', 'Upper Respiratory Infection'];
      urgency = 'medium';
      recommendation = 'Consult a doctor for evaluation and testing. Isolate yourself to prevent spread. Monitor oxygen levels if possible.';
      detailedAnalysis = `Fever with respiratory symptoms, common in viral infections like influenza or COVID-19, requires medical consultation for diagnosis and management.`;
      riskFactors.push('Exposure to sick individuals', 'Seasonal factors', 'Vaccination status');
      followUpActions.push('Viral testing (Flu, COVID-19)', 'Rest and hydration', 'Symptomatic treatment', 'Monitor for worsening respiratory distress');
    } else {
      diagnosis = ['Common Cold', 'Viral Gastroenteritis', 'Mild Flu'];
      urgency = 'low';
      recommendation = 'Rest, fluids, and over-the-counter fever reducers. If fever persists over 3 days or exceeds 103°F, consult a doctor.';
      detailedAnalysis = `A mild fever of ${duration} duration without severe associated symptoms is commonly indicative of a self-limiting viral illness.`;
      riskFactors.push('General viral exposure', 'Fatigue');
      followUpActions.push('Symptomatic relief', 'Adequate rest', 'Hygiene practices');
    }
  }
  // Abdominal Pain Scenarios (refined)
  else if (lowerSymptoms.includes('abdominal pain') || lowerSymptoms.includes('stomach pain')) {
    const hasVomiting = lowerSymptoms.includes('vomiting') || lowerSymptoms.includes('nausea');
    const hasDiarrhea = lowerSymptoms.includes('diarrhea');
    const hasBlood = lowerSymptoms.includes('bloody stool') || lowerSymptoms.includes('black stool');
    const location = lowerSymptoms.includes('right lower') ? 'right lower quadrant' : lowerSymptoms.includes('right upper') ? 'right upper quadrant' : lowerSymptoms.includes('left lower') ? 'left lower quadrant' : lowerSymptoms.includes('left upper') ? 'left upper quadrant' : 'general';

    if (severity === 'severe' || hasBlood || location === 'right lower quadrant' && hasVomiting || lowerSymptoms.includes('sudden severe') && lowerSymptoms.includes('back pain')) {
      diagnosis = ['Appendicitis', 'Peritonitis', 'Pancreatitis', 'Bowel Obstruction', 'Ectopic Pregnancy (in females)', 'Kidney Stones', 'Aortic Aneurysm Rupture'];
      urgency = 'high';
      recommendation = 'Severe or sudden abdominal pain, especially with specific location (e.g., right lower quadrant), vomiting, or blood in stool, requires immediate emergency evaluation.';
      detailedAnalysis = `The combination of ${severity} abdominal pain with ${location} involvement and ${hasVomiting ? 'vomiting' : ''}${hasBlood ? ' or bloody stool' : ''} points to acute abdominal conditions that may require surgical intervention or urgent medical management. Your age and gender are factored in for differential diagnosis (e.g., ectopic pregnancy for females).`;
      riskFactors.push('Acute onset', 'Localized tenderness', 'Associated systemic signs');
      followUpActions.push('Emergency room evaluation', 'Abdominal imaging (Ultrasound/CT scan)', 'Blood tests', 'Surgical consultation');
      redFlagSymptoms.push('severe localized pain', 'fever with abdominal pain', 'bloody stool', 'rigid abdomen', 'inability to pass gas/stool');
    } else if (hasVomiting && hasDiarrhea) {
      diagnosis = ['Gastroenteritis (Viral/Bacterial)', 'Food Poisoning'];
      urgency = 'medium';
      recommendation = 'Stay hydrated with oral rehydration solutions. Avoid solid foods initially. If symptoms persist beyond 2-3 days or severe dehydration occurs, consult a doctor.';
      detailedAnalysis = `Abdominal pain with vomiting and diarrhea is typical for gastroenteritis. While usually self-limiting, dehydration is a risk, especially with prolonged symptoms.`;
      riskFactors.push('Recent dietary changes', 'Exposure to contaminated food/water');
      followUpActions.push('Fluid and electrolyte management', 'Bland diet', 'Hygiene practices');
    } else {
      diagnosis = ['Indigestion', 'Irritable Bowel Syndrome (IBS)', 'Gas Pain', 'Constipation'];
      urgency = 'low';
      recommendation = 'Focus on dietary modifications, hydration, and fiber intake. If pain recurs or worsens, consult a doctor.';
      detailedAnalysis = `Mild or general abdominal discomfort with ${duration} duration often relates to functional bowel issues or minor digestive upset.`;
      riskFactors.push('Stress', 'Dietary triggers', 'Lack of fiber');
      followUpActions.push('Dietary diary', 'Stress management', 'Fiber supplements');
    }
  }
  // Shortness of Breath Scenarios (refined)
  else if (lowerSymptoms.includes('shortness of breath') || lowerSymptoms.includes('dyspnea')) {
    const hasChestPain = lowerSymptoms.includes('chest pain');
    const hasWheezing = lowerSymptoms.includes('wheezing');
    const hasSwelling = lowerSymptoms.includes('swelling in legs') || lowerSymptoms.includes('ankle swelling');

    if (severity === 'severe' || hasChestPain || hasSwelling || lowerSymptoms.includes('unable to speak in full sentences')) {
      diagnosis = ['Pulmonary Embolism', 'Acute Heart Failure', 'Severe Asthma Exacerbation', 'Pneumothorax', 'Anaphylaxis'];
      urgency = 'high';
      recommendation = 'Severe shortness of breath, especially with chest pain or swelling, is a medical emergency. Call 911/112/108 immediately.';
      detailedAnalysis = `The presence of severe dyspnea, particularly if accompanied by chest pain or signs of fluid retention, indicates critical respiratory or cardiac compromise requiring immediate emergency medical attention. Your existing conditions (${userConditions.join(', ')}) could predispose you to such events.`;
      riskFactors.push('Pre-existing cardiac/pulmonary conditions', 'Recent surgery/immobilization (for PE)', 'Allergen exposure (for anaphylaxis)');
      followUpActions.push('Emergency medical services', 'Oxygen therapy', 'ECG, chest X-ray', 'Blood tests (D-dimer for PE)');
      redFlagSymptoms.push('severe difficulty breathing', 'blue discoloration', 'unable to speak', 'wheezing at rest', 'chest pain with dyspnea');
    } else if (hasWheezing || userConditions.includes('Asthma') || userConditions.includes('COPD')) {
      diagnosis = ['Asthma Exacerbation', 'COPD Exacerbation', 'Bronchitis'];
      urgency = 'medium';
      recommendation = 'Use your prescribed inhalers. If symptoms do not improve rapidly or worsen, seek urgent medical care.';
      detailedAnalysis = `Shortness of breath with wheezing in someone with a history of asthma or COPD suggests an exacerbation. Proper management of your chronic condition is essential.`;
      riskFactors.push('Trigger exposure', 'Infections', 'Poor medication adherence');
      followUpActions.push('Review inhaler technique', 'Avoid triggers', 'Follow-up with pulmonologist');
    } else {
      diagnosis = ['Anxiety-related Dyspnea', 'Mild Respiratory Infection', 'Deconditioning'];
      urgency = 'low';
      recommendation = 'Practice breathing exercises, manage stress. If symptoms persist or worsen, consult a doctor.';
      detailedAnalysis = `Mild shortness of breath without other concerning symptoms may be due to anxiety or less severe respiratory issues.`;
      riskFactors.push('Stress', 'Sedentary lifestyle');
      followUpActions.push('Breathing techniques', 'Regular exercise');
    }
  }
  // Dizziness/Vertigo Scenarios (refined)
  else if (lowerSymptoms.includes('dizziness') || lowerSymptoms.includes('lightheaded') || lowerSymptoms.includes('vertigo')) {
    const hasFainting = lowerSymptoms.includes('fainting') || lowerSymptoms.includes('loss of consciousness');
    const hasNumbness = lowerSymptoms.includes('numbness') || lowerSymptoms.includes('weakness');
    const hasVisionChanges = lowerSymptoms.includes('blurred vision') || lowerSymptoms.includes('double vision');

    if (hasFainting || hasNumbness || hasVisionChanges || lowerSymptoms.includes('sudden onset') && severity === 'severe') {
      diagnosis = ['Stroke', 'TIA', 'Arrhythmia', 'Severe Dehydration', 'Internal Bleeding'];
      urgency = 'high';
      recommendation = 'Sudden severe dizziness with fainting, numbness, or vision changes is a medical emergency. Seek immediate emergency care.';
      detailedAnalysis = `Dizziness combined with neurological symptoms (numbness, weakness, vision changes) or syncope (fainting) indicates a potentially life-threatening condition affecting the brain or cardiovascular system. Your age and existing medications (${userMedications.join(', ')}) could be contributing factors.`;
      riskFactors.push('Cardiovascular disease', 'Diabetes', 'Hypertension', 'Certain medications');
      followUpActions.push('Emergency room evaluation', 'Brain imaging (CT/MRI)', 'ECG and cardiac monitoring', 'Neurological assessment');
      redFlagSymptoms.push('sudden onset dizziness', 'fainting', 'weakness/numbness on one side', 'speech difficulties', 'severe headache');
    } else if (lowerSymptoms.includes('spinning sensation') || lowerSymptoms.includes('head movements')) {
      diagnosis = ['Benign Paroxysmal Positional Vertigo (BPPV)', 'Labyrinthitis', 'Meniere\'s Disease'];
      urgency = 'medium';
      recommendation = 'Consult an ENT or neurologist for diagnosis and specific maneuvers/medications. Avoid sudden head movements.';
      detailedAnalysis = `A spinning sensation (vertigo) often triggered by head movements suggests an inner ear disorder. Further evaluation can pinpoint the specific condition.`;
      riskFactors.push('Head injury', 'Viral infections (for labyrinthitis)');
      followUpActions.push('Epley maneuver (for BPPV)', 'Vestibular suppressants', 'Audiometry');
    } else {
      diagnosis = ['Orthostatic Hypotension', 'Dehydration', 'Anxiety', 'Medication Side Effect'];
      urgency = 'low';
      recommendation = 'Ensure adequate hydration, stand up slowly. Review your medications with your doctor if symptoms persist.';
      detailedAnalysis = `Generalized lightheadedness is often due to dehydration, low blood pressure upon standing, or medication side effects.`;
      riskFactors.push('Dehydration', 'Diuretic use', 'Age');
      followUpActions.push('Fluid intake increase', 'Blood pressure monitoring', 'Medication review');
    }
  }
  // General symptoms
  else {
    diagnosis = ['Common Cold', 'Mild Viral Syndrome', 'Fatigue', 'Stress-related Symptoms'];
    urgency = 'low';
    recommendation = 'Rest, maintain hydration, and observe your symptoms. If they worsen or persist, consult a general practitioner.';
    detailedAnalysis = `Your symptoms are broad and do not immediately suggest a severe condition. This could be a common viral illness or related to lifestyle factors. It's important to monitor for any new or escalating symptoms.`;
    riskFactors.push('General health status', 'Lifestyle factors');
    followUpActions.push('Symptom monitoring', 'Self-care', 'Follow-up with GP if symptoms persist beyond a week or worsen.');
  }

  // Enhance analysis with user-specific conditions/medications more broadly
  if (userConditions.length > 0) {
    userConditions.forEach(condition => {
      // Example: If user has diabetes and reports blurry vision, suggest diabetic retinopathy
      if (condition.toLowerCase().includes('diabetes') && lowerSymptoms.includes('blurry vision')) {
        diagnosis.push('Diabetic Retinopathy (consider)');
        riskFactors.push('Long-standing diabetes');
        followUpActions.push('Ophthalmologist referral');
        detailedAnalysis += ` Given your history of ${condition}, the symptoms could be related to complications of your existing condition.`;
      }
      // Example: If user has asthma and reports cough, emphasize asthma exacerbation
      if (condition.toLowerCase().includes('asthma') && lowerSymptoms.includes('cough')) {
        if (!diagnosis.includes('Asthma Exacerbation')) diagnosis.unshift('Asthma Exacerbation'); // Prioritize if not already there
        riskFactors.push('Known asthma', 'Environmental triggers');
        detailedAnalysis += ` Your pre-existing ${condition} makes it important to consider an exacerbation as a primary cause.`;
      }
    });
  }

  if (userMedications.length > 0) {
    userMedications.forEach(med => {
      // Example: If user on blood thinners and reports bruising, highlight bleeding risk
      if (['warfarin', 'dabigatran', 'rivaroxaban', 'apixaban'].some(m => med.toLowerCase().includes(m)) && lowerSymptoms.includes('bruising')) {
        riskFactors.push(`Medication side effect (${med} - increased bleeding risk)`);
        followUpActions.push('Consult prescribing doctor about bruising');
        detailedAnalysis += ` Your current medication (${med}) could be contributing to some of your symptoms, such as easy bruising.`;
      }
    });
  }

  // Fallback if no specific diagnosis is found but severity is high
  if (urgency === 'high' && diagnosis.length === 0) {
    diagnosis = ['Undetermined Severe Condition'];
    detailedAnalysis = 'Given the severity of symptoms, immediate medical evaluation is paramount, even if a specific likely diagnosis cannot be precisely determined without further tests.';
  }

  // Prioritize "probable causes" if specific conditions are very likely
  probableCauses = differentialDiagnoses.filter(d => d.likelihood === 'High').map(d => d.condition);
  if (probableCauses.length === 0 && diagnosis.length > 0) {
    probableCauses = diagnosis; // Fallback to main diagnosis list if no high likelihood differential
  }

  return {
    id: Date.now().toString(),
    userId: userProfile.age ? 'user-authenticated' : 'guest', // Reflect if user data was available
    symptoms: symptoms,
    duration,
    severity,
    additionalInfo,
    diagnosis, // Now represents a broader differential
    recommendation,
    urgency,
    detailedAnalysis,
    riskFactors,
    followUpActions,
    timestamp: new Date(),
    // New fields
    probableCauses,
    differentialDiagnoses,
    redFlagSymptoms,
  };
};

const SymptomChecker: React.FC = () => {
  const { user } = useAuth(); // Assuming useAuth provides a user object with id, name, age, gender, diseases, medications, emergencyContact
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [history, setHistory] = useState<SymptomAnalysis[]>([]);

  // Memoize the analysis function to prevent unnecessary re-renders or re-creations
  const analyzeSymptoms = useCallback(
    async (
      symptomText: string,
      duration: string,
      severity: string,
      additionalInfo: string
    ): Promise<SymptomAnalysis | null> => {
      const userProfile = {
        age: user?.age || 30, // Default age if not available
        gender: user?.gender || 'unknown', // Default gender if not available
        conditions: user?.diseases || [], // Assuming 'diseases' maps to 'conditions'
        medications: user?.medications || [],
      };

      try {
        const result = await fetchAIAnalysis({
          symptoms: symptomText,
          duration,
          severity,
          userProfile,
          additionalInfo,
        });
        return result;
      } catch (error) {
        console.error('Error during AI analysis:', error);
        // Handle error gracefully, perhaps return a default error analysis
        return {
          id: Date.now().toString(),
          userId: user?.id || 'guest',
          symptoms: symptomText,
          duration,
          severity,
          additionalInfo,
          diagnosis: ['Analysis Error'],
          recommendation: 'Could not complete analysis. Please try again or consult a doctor directly.',
          urgency: 'low',
          detailedAnalysis: 'An error occurred while processing your symptoms. This may be due to a temporary issue with the AI service or network. Please consider seeking medical advice from a healthcare professional.',
          riskFactors: [],
          followUpActions: [],
          timestamp: new Date(),
          probableCauses: [],
          differentialDiagnoses: [],
          redFlagSymptoms: [],
        };
      }
    },
    [user] // Recreate if user data changes
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || !duration || !severity) return; // Ensure all required fields are filled

    setIsAnalyzing(true);
    setAnalysis(null); // Clear previous analysis
    try {
      const result = await analyzeSymptoms(symptoms, duration, severity, additionalInfo);
      if (result) {
        setAnalysis(result);
        setHistory(prev => [result, ...prev]);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // Error state will be handled by the analyzeSymptoms catch block
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;

    try {
      await PDFExportUtil.generateReportPDF({
        'Patient Name': user?.name || 'Guest',
        'Date': analysis.timestamp.toLocaleString(),
        'Symptoms Reported': analysis.symptoms,
        'Duration': analysis.duration,
        'Severity': analysis.severity,
        'Additional Information': analysis.additionalInfo || 'N/A',
        'Urgency Level': analysis.urgency.toUpperCase(),
        'Probable Causes': analysis.probableCauses.length > 0 ? analysis.probableCauses.join(', ') : 'No specific probable cause identified.',
        'Possible Diagnoses (Differential)': analysis.differentialDiagnoses.map(d => `${d.condition} (${d.likelihood})`).join('; ') || 'No specific differential diagnoses provided.',
        'Detailed Analysis': analysis.detailedAnalysis,
        'Risk Factors': analysis.riskFactors?.join(', ') || 'None identified',
        'Red Flag Symptoms': analysis.redFlagSymptoms?.join(', ') || 'None identified',
        'Recommendations': analysis.recommendation,
        'Follow-up Actions': analysis.followUpActions?.join(', ') || 'Standard monitoring',
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
                      <option value="3-7 days">1-7 days</option> {/* Changed to 1-7 days for broader common illnesses */}
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
                    placeholder="Any triggers, associated symptoms (e.g., nausea, dizziness), recent travel, medications taken, or other relevant medical history that isn't in your profile..."
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
                      <p className="text-sm mt-1 font-medium text-red-700">🚨 IMMEDIATE MEDICAL EMERGENCY: Action required.</p>
                    )}
                    {analysis.urgency === 'medium' && (
                      <p className="text-sm mt-1 font-medium text-yellow-700">Consult a doctor soon; monitor symptoms closely.</p>
                    )}
                    {analysis.urgency === 'low' && (
                      <p className="text-sm mt-1 font-medium text-green-700">Self-care and monitoring advised. Consult if symptoms persist.</p>
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

                {/* Probable Causes */}
                {analysis.probableCauses && analysis.probableCauses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                      <FlaskConical className="h-6 w-6 text-purple-600 mr-2" />
                      Most Probable Causes:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.probableCauses.map((condition, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-purple-800 font-medium">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Possible Diagnoses (Differential) */}
                {analysis.differentialDiagnoses && analysis.differentialDiagnoses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                      <Search className="h-6 w-6 text-gray-600 mr-2" />
                      Differential Diagnoses (Other Possibilities):
                    </h3>
                    <div className="space-y-3">
                      {analysis.differentialDiagnoses.map((item, index) => (
                        <div key={index} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-gray-800 font-medium mb-1">{item.condition} <span className="text-sm text-gray-500">({item.likelihood})</span></p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                      Identified Risk Factors
                    </h3>
                    <div className="space-y-2">
                      {analysis.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-yellow-800">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flag Symptoms */}
                {analysis.redFlagSymptoms && analysis.redFlagSymptoms.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-red-700 mb-4 text-lg flex items-center">
                      <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                      Red Flag Symptoms Noted:
                    </h3>
                    <div className="space-y-2">
                      {analysis.redFlagSymptoms.map((flag, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-red-800 font-semibold">{flag.toUpperCase()}</span>
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
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
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
                    <div key={item.id} className="border-2 border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md cursor-pointer"
                      onClick={() => setAnalysis(item)} // Allow clicking history to view analysis
                    >
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
                  <span>Be specific about symptom location and quality (e.g., sharp, dull, throbbing)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Include timing, triggers, and aggravating/alleviating factors</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Mention any associated symptoms (e.g., fever with cough, nausea with headache)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Rate severity on a clear scale (e.g., 1-10)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Include relevant past medical history and current medications</span>
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
                <p className="text-red-700"><strong>Emergency Services:</strong> 911 / 112 / 108 (or your local emergency number)</p>
                <p className="text-red-700"><strong>Poison Control:</strong> 1-800-222-1222 (US) - Find local number for other regions</p>
                <p className="text-red-700"><strong>Crisis Hotline:</strong> 988 (US) - Find local number for other regions</p>
                {user?.emergencyContact && (
                  <p className="text-red-700"><strong>Your Emergency Contact:</strong> {user.emergencyContact}</p>
                )}
                {!user?.emergencyContact && (
                  <p className="text-red-700 italic">Consider adding an emergency contact in your profile.</p>
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