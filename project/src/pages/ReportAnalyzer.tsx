import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, FileText, XCircle, Loader, FlaskConical, Stethoscope, Lightbulb, ClipboardCheck, AlertCircle, Download } from 'lucide-react'; // Added AlertCircle and Download icon
import { useAuth } from '../contexts/AuthContext'; // Assuming this provides user profile
import { PDFExportUtil } from '../utils/pdfExport'; // Importing your PDF utility

// Define types for better type safety and clarity
interface MedicalReport {
  id: string;
  userId: string;
  fileName: string;
  reportType: string;
  extractedData: Record<
    string,
    {
      value: number | string;
      unit: string;
      normalRange: string;
      status: 'Normal' | 'High' | 'Low' | 'Borderline High' | 'Slightly High' | 'Elevated' | 'Critical High' | 'Critical Low';
    }
  >;
  analysis: string;
  suggestion: string;
  prescription: string;
  uploadDate: Date;
}

// Helper function to determine status based on value and range
const getStatus = (value: number, min: number, max: number): MedicalReport['extractedData'][string]['status'] => {
  if (typeof value !== 'number') return 'Normal'; // For non-numeric values like 'Positive' / 'Negative'

  // Define thresholds for different statuses relative to normal range
  const range = max - min;
  const criticalHighThreshold = max + range * 0.5; // e.g., 50% above max
  const elevatedThreshold = max + range * 0.25; // e.g., 25% above max
  const slightlyHighThreshold = max + range * 0.1; // e.g., 10% above max
  const borderlineHighThreshold = max + range * 0.02; // e.g., 2% above max

  const criticalLowThreshold = min - range * 0.5; // e.g., 50% below min
  const lowThreshold = min - range * 0.1; // e.g., 10% below min
  const slightlyLowThreshold = min - range * 0.02; // e.g., 2% below min


  if (value < min) {
    if (value <= criticalLowThreshold) return 'Critical Low';
    if (value <= lowThreshold) return 'Low';
    if (value <= slightlyLowThreshold) return 'Slightly Low'; // Added slightly low
    return 'Low'; // Default for anything below min
  }
  if (value > max) {
    if (value >= criticalHighThreshold) return 'Critical High';
    if (value >= elevatedThreshold) return 'Elevated';
    if (value >= slightlyHighThreshold) return 'Slightly High';
    if (value >= borderlineHighThreshold) return 'Borderline High';
    return 'High'; // Default for anything above max
  }
  return 'Normal';
};


const ReportAnalyzer: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated user (replace with actual user from context if available)
  const { user } = useAuth(); // Assuming useAuth provides { id: string, name: string }

  // Simulated file reading and initial data extraction based on filename
  const processFileUpload = useCallback(async (file: File): Promise<MedicalReport> => {
    setLoading(true);
    setError(null);

    // Simulate delay for file processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const fileName = file.name.toLowerCase();
    let extractedData: MedicalReport['extractedData'] = {};
    let reportType = 'General Medical Report';
    let analysis = '';
    let suggestion = '';
    let prescription = '';

    // --- Rule-Based Logic for Data Extraction, Analysis, Suggestions, and Prescriptions ---
    // Note: WHO norms are complex and context-dependent. These are simplified for demonstration.
    // For a real system, a comprehensive medical knowledge base would be required.

    if (fileName.includes('cbc') || fileName.includes('blood count')) {
      reportType = 'Complete Blood Count (CBC)';
      extractedData = {
        'Hemoglobin': { value: 13.5, unit: 'g/dL', normalRange: '12.0-16.0', status: getStatus(13.5, 12.0, 16.0) },
        'WBC Count': { value: 7.2, unit: 'x10^9/L', normalRange: '4.0-11.0', status: getStatus(7.2, 4.0, 11.0) },
        'RBC Count': { value: 4.8, unit: 'x10^12/L', normalRange: '4.2-5.4', status: getStatus(4.8, 4.2, 5.4) },
        'Platelet Count': { value: 250, unit: 'x10^9/L', normalRange: '150-450', status: getStatus(250, 150, 450) },
        'Hematocrit': { value: 41, unit: '%', normalRange: '36-46', status: getStatus(41, 36, 46) },
        'MCV': { value: 88, unit: 'fL', normalRange: '80-100', status: getStatus(88, 80, 100) },
        'MCH': { value: 29, unit: 'pg', normalRange: '27-33', status: getStatus(29, 27, 33) },
        'MCHC': { value: 33, unit: 'g/dL', normalRange: '32-36', status: getStatus(33, 32, 36) },
        'RDW': { value: 13.5, unit: '%', normalRange: '11.5-14.5', status: getStatus(13.5, 11.5, 14.5) },
        'Neutrophils': { value: 60, unit: '%', normalRange: '40-75', status: getStatus(60, 40, 75) },
        'Lymphocytes': { value: 30, unit: '%', normalRange: '20-45', status: getStatus(30, 20, 45) },
        'Eosinophils': { value: 2, unit: '%', normalRange: '1-6', status: getStatus(2, 1, 6) },
        'Basophils': { value: 0.5, unit: '%', normalRange: '0-2', status: getStatus(0.5, 0, 2) },
        'Monocytes': { value: 5, unit: '%', normalRange: '2-10', status: getStatus(5, 2, 10) },
      };
      
      const hgbStatus = extractedData['Hemoglobin'].status;
      const wbcStatus = extractedData['WBC Count'].status;
      const pltStatus = extractedData['Platelet Count'].status;
      const rbcStatus = extractedData['RBC Count'].status;

      if (hgbStatus === 'Normal' && wbcStatus === 'Normal' && pltStatus === 'Normal' && rbcStatus === 'Normal') {
        analysis = 'All Complete Blood Count (CBC) parameters are within normal limits, indicating healthy blood composition and no signs of anemia, infection, or bleeding disorders.';
        suggestion = 'Maintain a balanced, nutrient-rich diet with adequate iron and vitamins. Engage in regular physical activity (e.g., 30 minutes of moderate exercise most days). Ensure consistent hydration throughout the day.';
        prescription = 'No specific medication required. Routine annual health check-up including a CBC is recommended to monitor overall blood health.';
      } else if (hgbStatus === 'Low' || rbcStatus === 'Low' || extractedData['MCV'].status !== 'Normal' || extractedData['MCH'].status !== 'Normal') {
        analysis = 'Hemoglobin and/or Red Blood Cell count are low, suggesting anemia. Further investigation into the type (e.g., microcytic, macrocytic) and cause of anemia is needed, potentially related to iron or vitamin deficiencies.';
        suggestion = 'Increase intake of iron-rich foods (e.g., lean red meat, poultry, fish, beans, lentils, spinach) and Vitamin C (citrus fruits, bell peppers) to enhance iron absorption. Avoid tea/coffee with meals as they can inhibit iron absorption.';
        prescription = 'Consult a doctor for diagnosis and appropriate management of anemia. This may include iron or B12 supplementation, dietary changes, and addressing any underlying causes (e.g., chronic blood loss). Follow-up CBC and specific anemia tests (e.g., ferritin, B12, folate) in 1-3 months.';
      } else if (wbcStatus === 'High' || extractedData['Neutrophils'].status === 'High') {
        analysis = 'White Blood Cell count and/or Neutrophils are high, which strongly suggests an active bacterial infection or significant inflammation in the body.';
        suggestion = 'Monitor closely for symptoms of infection such as fever, chills, localized pain, or swelling. Ensure adequate rest and fluid intake. Practice good hygiene to prevent further spread of infection.';
        prescription = 'Consult a physician promptly for evaluation to identify the source and type of infection/inflammation. This may require antibiotics, anti-inflammatory drugs, or other specific treatments as prescribed. Further diagnostic tests (e.g., cultures) might be necessary.';
      } else if (wbcStatus === 'Low' || extractedData['Neutrophils'].status === 'Low' || extractedData['Lymphocytes'].status === 'Low') {
        analysis = 'White Blood Cell count and/or specific white cell types (e.g., Neutrophils, Lymphocytes) are low, which could indicate a weakened immune system, viral infection, bone marrow issues, or side effects of certain medications.';
        suggestion = 'Avoid crowded places and contact with sick individuals to minimize infection risk. Maintain excellent hygiene. Consume a nutrient-dense diet to support immune function.';
        prescription = 'Consult a physician for detailed investigation into the cause of low WBC count. This may involve reviewing medication history, further blood tests, or bone marrow examination. Management will depend on the underlying diagnosis and may include immune-boosting strategies or specific interventions.';
      } else if (pltStatus === 'High') {
        analysis = 'Platelet count is high (thrombocytosis), which can be reactive (due to infection, inflammation, iron deficiency) or primary (bone marrow disorder).';
        suggestion = 'Maintain good hydration. Avoid unnecessary anti-platelet medications unless advised by a doctor.';
        prescription = 'Consult a physician to investigate the cause of thrombocytosis. Management depends on the underlying reason and may involve treating the primary condition or specific medications if the risk of clotting is high. Follow-up platelet count is recommended.';
      } else if (pltStatus === 'Low') {
        analysis = 'Platelet count is low (thrombocytopenia), increasing the risk of bleeding. Causes can range from viral infections, medication side effects, or autoimmune conditions to bone marrow disorders.';
        suggestion = 'Avoid activities that could cause injury or bleeding. Be cautious with medications that affect platelet function (e.g., NSAIDs).';
        prescription = 'Consult a physician promptly for evaluation to identify the cause of thrombocytopenia. Management depends on the underlying reason and severity, and may involve treating the primary condition or specific interventions to raise platelet count. Avoid self-medication.';
      } else {
        analysis = 'Some CBC parameters show minor deviations (e.g., borderline or slightly high/low). While not immediately critical, these warrant attention to prevent progression or identify early issues.';
        suggestion = 'Continue healthy lifestyle practices including a balanced diet and regular exercise. Pay attention to any new or persistent symptoms.';
        prescription = 'Routine follow-up as advised by your healthcare provider. Discuss these specific findings during your next medical consultation.';
      }

    } else if (fileName.includes('lipid') || fileName.includes('cholesterol')) {
      reportType = 'Lipid Profile';
      extractedData = {
        'Total Cholesterol': { value: 225, unit: 'mg/dL', normalRange: '<200', status: getStatus(225, 0, 200) }, // WHO recommends <200
        'LDL Cholesterol': { value: 150, unit: 'mg/dL', normalRange: '<100', status: getStatus(150, 0, 100) }, // WHO recommends <100
        'HDL Cholesterol': { value: 45, unit: 'mg/dL', normalRange: '>40', status: getStatus(45, 40, Infinity) },
        'Triglycerides': { value: 180, unit: 'mg/dL', normalRange: '<150', status: getStatus(180, 0, 150) },
        'VLDL Cholesterol': { value: 36, unit: 'mg/dL', normalRange: '5-40', status: getStatus(36, 5, 40) },
      };

      const totalCholesterolStatus = extractedData['Total Cholesterol'].status;
      const ldlStatus = extractedData['LDL Cholesterol'].status;
      const hdlStatus = extractedData['HDL Cholesterol'].status;
      const triglyceridesStatus = extractedData['Triglycerides'].status;

      if (totalCholesterolStatus === 'Normal' && ldlStatus === 'Normal' && hdlStatus === 'Normal' && triglyceridesStatus === 'Normal') {
        analysis = 'Your lipid profile is within healthy limits, indicating a low risk for cardiovascular disease. This is an excellent result.';
        suggestion = 'Continue to maintain a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins. Engage in regular physical activity (e.g., at least 150 minutes of moderate-intensity aerobic exercise per week). Avoid smoking and limit alcohol intake.';
        prescription = 'No medication required. An annual lipid profile check is recommended to monitor your cardiovascular health.';
      } else if (ldlStatus === 'High' || triglyceridesStatus === 'High' || totalCholesterolStatus === 'High' || totalCholesterolStatus === 'Borderline High') {
        analysis = 'Elevated levels of LDL ("bad" cholesterol) and/or triglycerides, or high total cholesterol, indicate an increased risk of atherosclerosis and cardiovascular disease (e.g., heart attack, stroke).';
        suggestion = 'Adopt a strict low-saturated fat, low-trans fat, and low-cholesterol diet. Prioritize soluble fiber (oats, beans, apples) and omega-3 fatty acids (fatty fish, flaxseeds). Engage in at least 30-60 minutes of moderate-intensity exercise most days of the week. Achieve and maintain a healthy weight. Quit smoking if applicable.';
        prescription = 'Consult a cardiologist or your primary care physician for a personalized management plan. This may include therapeutic lifestyle changes, and if insufficient, medication (e.g., statins, fibrates) may be considered. Follow-up lipid profile in 3-6 months to assess the effectiveness of interventions.';
      } else if (hdlStatus === 'Low') {
        analysis = 'Low HDL ("good" cholesterol) is a significant risk factor for heart disease, even if other lipids are normal. HDL helps remove excess cholesterol from arteries.';
        suggestion = 'Increase physical activity, especially aerobic exercise. Incorporate healthy fats (e.g., avocados, nuts, olive oil) into your diet. Avoid trans fats. Consider moderate alcohol consumption only if appropriate and advised by a doctor.';
        prescription = 'Consult a doctor to discuss strategies to raise HDL, alongside managing other lipid parameters. No direct medication for low HDL typically.';
      } else {
        analysis = 'Borderline or slightly elevated lipid levels. These warrant attention and proactive lifestyle changes to prevent progression and reduce future cardiovascular risk.';
        suggestion = 'Focus on consistent dietary improvements and regular exercise. Limit processed foods and sugary drinks.';
        prescription = 'Monitor lipid levels closely. Discuss with your doctor if lifestyle changes are not sufficient after 3-6 months, as medication might be considered.';
      }

    } else if (fileName.includes('kidney') || fileName.includes('renal')) {
      reportType = 'Kidney Function Test (KFT)';
      extractedData = {
        'Creatinine': { value: 1.5, unit: 'mg/dL', normalRange: '0.6-1.2', status: getStatus(1.5, 0.6, 1.2) },
        'BUN (Urea Nitrogen)': { value: 28, unit: 'mg/dL', normalRange: '7-20', status: getStatus(28, 7, 20) },
        'eGFR': { value: 50, unit: 'mL/min/1.73m²', normalRange: '>60', status: getStatus(50, 60, Infinity) },
        'Uric Acid': { value: 7.5, unit: 'mg/dL', normalRange: '3.5-7.0', status: getStatus(7.5, 3.5, 7.0) },
        'Sodium': { value: 138, unit: 'mEq/L', normalRange: '135-145', status: getStatus(138, 135, 145) },
        'Potassium': { value: 4.2, unit: 'mEq/L', normalRange: '3.5-5.1', status: getStatus(4.2, 3.5, 5.1) },
        'Chloride': { value: 102, unit: 'mEq/L', normalRange: '98-106', status: getStatus(102, 98, 106) },
        'Bicarbonate': { value: 25, unit: 'mEq/L', normalRange: '22-29', status: getStatus(25, 22, 29) },
      };

      const creatinineStatus = extractedData['Creatinine'].status;
      const bunStatus = extractedData['BUN (Urea Nitrogen)'].status;
      const egfrStatus = extractedData['eGFR'].status;

      if (creatinineStatus === 'Normal' && bunStatus === 'Normal' && egfrStatus === 'Normal') {
        analysis = 'All kidney function indicators are within normal limits, suggesting healthy kidney function.';
        suggestion = 'Maintain good hydration by drinking adequate water throughout the day. Follow a balanced diet and avoid excessive use of over-the-counter pain relievers (NSAIDs) which can harm kidneys.';
        prescription = 'No specific medication required. Routine check-up as advised by your healthcare provider to monitor kidney health.';
      } else if (creatinineStatus === 'High' || bunStatus === 'High' || egfrStatus === 'Low') {
        analysis = 'Elevated creatinine and BUN, or significantly reduced eGFR, strongly suggest impaired kidney function or kidney disease. This requires urgent and comprehensive evaluation.';
        suggestion = 'Ensure adequate hydration but avoid excessive fluid intake without medical advice. Strictly avoid over-the-counter pain relievers (NSAIDs) and other nephrotoxic drugs. Control underlying conditions like high blood pressure and diabetes, as they significantly impact kidney health. Limit high-protein foods if advised by a doctor.';
        prescription = 'Consult a nephrologist (kidney specialist) immediately for comprehensive assessment, diagnosis, and management of kidney dysfunction. Further tests like urine analysis for protein, kidney ultrasound, or biopsy may be recommended. Regular and close monitoring of kidney function is crucial.';
      } else if (creatinineStatus === 'Slightly High' || bunStatus === 'Slightly High' || egfrStatus === 'Slightly Low') {
        analysis = 'Minor deviations in kidney function tests. These could indicate early kidney stress, dehydration, or be influenced by diet/medication. Warrants attention.';
        suggestion = 'Increase fluid intake (water) unless advised otherwise. Review all current medications with your doctor. Maintain a healthy lifestyle and manage blood pressure/sugar if applicable.';
        prescription = 'Discuss these results with your primary care physician for personalized advice and potential follow-up kidney function tests in 1-3 months.';
      } else {
        analysis = 'Some kidney function parameters show minor deviations that are not immediately critical but warrant attention. Electrolyte levels are generally stable.';
        suggestion = 'Review medication usage and hydration. Maintain a healthy lifestyle.';
        prescription = 'Discuss these results with your primary care physician for personalized advice and potential follow-up.';
      }

    } else if (fileName.includes('lft') || fileName.includes('liver')) {
      reportType = 'Liver Function Test (LFT)';
      extractedData = {
        'ALT (SGPT)': { value: 70, unit: 'U/L', normalRange: '7-56', status: getStatus(70, 7, 56) },
        'AST (SGOT)': { value: 80, unit: 'U/L', normalRange: '5-40', status: getStatus(80, 5, 40) },
        'Alkaline Phosphatase': { value: 130, unit: 'U/L', normalRange: '40-129', status: getStatus(130, 40, 129) },
        'Bilirubin Total': { value: 1.8, unit: 'mg/dL', normalRange: '0.1-1.2', status: getStatus(1.8, 0.1, 1.2) },
        'Direct Bilirubin': { value: 0.5, unit: 'mg/dL', normalRange: '0.0-0.3', status: getStatus(0.5, 0.0, 0.3) },
        'Albumin': { value: 3.2, unit: 'g/dL', normalRange: '3.4-5.4', status: getStatus(3.2, 3.4, 5.4) },
        'Total Protein': { value: 6.8, unit: 'g/dL', normalRange: '6.0-8.3', status: getStatus(6.8, 6.0, 8.3) },
        'GGT (Gamma-GT)': { value: 90, unit: 'U/L', normalRange: '0-60', status: getStatus(90, 0, 60) },
      };

      const altStatus = extractedData['ALT (SGPT)'].status;
      const astStatus = extractedData['AST (SGOT)'].status;
      const bilirubinStatus = extractedData['Bilirubin Total'].status;
      const albuminStatus = extractedData['Albumin'].status;
      const ggtStatus = extractedData['GGT (Gamma-GT)'].status;

      if (altStatus === 'Normal' && astStatus === 'Normal' && bilirubinStatus === 'Normal' && albuminStatus === 'Normal' && ggtStatus === 'Normal') {
        analysis = 'All liver function tests are within normal range, indicating healthy liver function.';
        suggestion = 'Maintain a healthy lifestyle, limit alcohol intake, and eat a balanced diet low in processed foods and unhealthy fats. Avoid unnecessary medications that can stress the liver.';
        prescription = 'No specific medication required. Routine check-up as advised.';
      } else if (altStatus === 'High' || astStatus === 'High' || ggtStatus === 'High') {
        analysis = 'Elevated liver enzymes (ALT, AST, GGT) suggest liver inflammation or damage. This can be due to various causes including fatty liver disease, alcohol, viral hepatitis, or medication side effects.';
        suggestion = 'Strictly avoid alcohol. Limit fatty and processed foods. Review all current medications with your doctor to identify any potential liver-toxic drugs. Maintain a healthy weight through diet and exercise.';
        prescription = 'Consult a gastroenterologist or hepatologist for a detailed assessment and diagnosis. Further tests like liver ultrasound, viral hepatitis markers, or liver biopsy may be recommended. Management will depend on the underlying cause.';
      } else if (bilirubinStatus === 'High') {
        analysis = 'Elevated bilirubin suggests issues with bile flow or liver processing of bilirubin. This can cause jaundice.';
        suggestion = 'Avoid alcohol. Stay hydrated. Monitor for yellowing of skin or eyes.';
        prescription = 'Consult a doctor to investigate the cause of hyperbilirubinemia. Further tests may include imaging of bile ducts or specific liver function tests.';
      } else if (albuminStatus === 'Low') {
        analysis = 'Low albumin may indicate chronic liver disease, kidney disease, severe malnutrition, or chronic inflammation. It suggests impaired liver synthesis or increased loss.';
        suggestion = 'Ensure adequate protein intake in your diet. Address any underlying nutritional deficiencies or chronic conditions.';
        prescription = 'Consult a physician to investigate the cause of low albumin. Management will target the underlying condition.';
      } else {
        analysis = 'Minor deviations in liver function tests. These warrant attention and follow-up to ensure liver health.';
        suggestion = 'Review medication use and alcohol consumption. Focus on a liver-friendly diet with plenty of fruits, vegetables, and whole foods.';
        prescription = 'Discuss with your primary care physician for personalized advice and potential follow-up LFTs in 1-3 months.';
      }

    } else if (fileName.includes('thyroid') || fileName.includes('tsh')) {
      reportType = 'Thyroid Function Test (TFT)';
      extractedData = {
        'TSH': { value: 7.5, unit: 'μIU/mL', normalRange: '0.4-4.0', status: getStatus(7.5, 0.4, 4.0) },
        'Free T3': { value: 2.8, unit: 'pg/mL', normalRange: '2.3-4.2', status: getStatus(2.8, 2.3, 4.2) },
        'Free T4': { value: 0.9, unit: 'ng/dL', normalRange: '0.8-1.8', status: getStatus(0.9, 0.8, 1.8) },
      };

      const tshStatus = extractedData['TSH'].status;
      const ft3Status = extractedData['Free T3'].status;
      const ft4Status = extractedData['Free T4'].status;

      if (tshStatus === 'Normal' && ft3Status === 'Normal' && ft4Status === 'Normal') {
        analysis = 'Thyroid function tests are within normal limits, indicating healthy thyroid gland activity.';
        suggestion = 'Maintain a balanced diet and healthy lifestyle. Ensure adequate iodine intake from diet (e.g., iodized salt, seafood) but avoid excessive amounts.';
        prescription = 'No specific medication required. Routine check-up as advised.';
      } else if (tshStatus === 'High' && ft4Status === 'Normal' && ft3Status === 'Normal') {
        analysis = 'Elevated TSH with normal Free T3 and Free T4 suggests subclinical hypothyroidism. This means your thyroid is working harder to produce enough hormones, but levels are still within range.';
        suggestion = 'Monitor for subtle symptoms of hypothyroidism like fatigue, mild weight gain, cold intolerance, dry skin, or constipation. Ensure adequate intake of selenium and zinc.';
        prescription = 'Consult an endocrinologist for evaluation. Treatment with thyroid hormone replacement (e.g., Levothyroxine) may be considered, especially if TSH is significantly high or symptoms are present. Follow-up TFT in 3-6 months.';
      } else if (tshStatus === 'High' && (ft4Status === 'Low' || ft3Status === 'Low')) {
        analysis = 'Elevated TSH with low Free T3 and/or Free T4 indicates primary hypothyroidism (underactive thyroid). Your thyroid gland is not producing enough hormones.';
        suggestion = 'Monitor for symptoms like significant fatigue, weight gain, cold intolerance, dry skin, hair loss, and constipation. Maintain a consistent sleep schedule.';
        prescription = 'Consult an endocrinologist for initiation of thyroid hormone replacement therapy (e.g., Levothyroxine). Regular monitoring of TSH and Free T4 is essential to adjust dosage until optimal levels are achieved.';
      } else if (tshStatus === 'Low' && (ft4Status === 'High' || ft3Status === 'High')) {
        analysis = 'Low TSH with high Free T3 and/or Free T4 indicates hyperthyroidism (overactive thyroid). Your thyroid gland is producing too many hormones.';
        suggestion = 'Monitor for symptoms like unexplained weight loss, rapid heartbeat (palpitations), anxiety, tremors, heat intolerance, and increased appetite. Avoid excessive iodine intake.';
        prescription = 'Consult an endocrinologist for diagnosis and management of hyperthyroidism. Treatment may involve anti-thyroid medications, radioactive iodine therapy, or surgery, depending on the cause and severity.';
      } else {
        analysis = 'Thyroid test results show some deviations that do not fit a clear pattern. Further evaluation is recommended to understand the underlying cause.';
        suggestion = 'Review any symptoms you are experiencing and note their frequency and severity. Avoid self-medicating with thyroid supplements.';
        prescription = 'Discuss these results with your primary care physician or an endocrinologist for a comprehensive assessment and further diagnostic steps.';
      }

    } else if (fileName.includes('hba1c') || fileName.includes('diabetes')) {
      reportType = 'Diabetes Panel';
      extractedData = {
        'Fasting Glucose': { value: 125, unit: 'mg/dL', normalRange: '70-100', status: getStatus(125, 70, 100) },
        'Postprandial Glucose': { value: 190, unit: 'mg/dL', normalRange: '<140', status: getStatus(190, 0, 140) },
        'HbA1c': { value: 7.1, unit: '%', normalRange: '<5.7', status: getStatus(7.1, 0, 5.7) }, // WHO pre-diabetes 5.7-6.4, diabetes >=6.5
        'Random Glucose': { value: 160, unit: 'mg/dL', normalRange: '<140', status: getStatus(160, 0, 140) },
        'Insulin (Fasting)': { value: 15, unit: 'μIU/mL', normalRange: '2.6-24.9', status: getStatus(15, 2.6, 24.9) },
      };

      const fastingGlucoseStatus = extractedData['Fasting Glucose'].status;
      const ppGlucoseStatus = extractedData['Postprandial Glucose'].status;
      const hba1cStatus = extractedData['HbA1c'].status;

      if (hba1cStatus === 'Normal' && fastingGlucoseStatus === 'Normal' && ppGlucoseStatus === 'Normal') {
        analysis = 'Blood glucose and HbA1c levels are within normal range, indicating good blood sugar control and a low risk of diabetes.';
        suggestion = 'Continue with a healthy, balanced diet low in refined sugars and processed foods. Engage in regular physical activity (e.g., 150 minutes of moderate exercise per week). Maintain a healthy weight.';
        prescription = 'No specific medication required. Routine annual check-up recommended to monitor blood sugar levels, especially if there is a family history of diabetes.';
      } else if (hba1cStatus === 'High' || fastingGlucoseStatus === 'High' || ppGlucoseStatus === 'High' ||
                 hba1cStatus === 'Elevated' || fastingGlucoseStatus === 'Elevated' || ppGlucoseStatus === 'Elevated' ||
                 hba1cStatus === 'Slightly High' || fastingGlucoseStatus === 'Slightly High' || ppGlucoseStatus === 'Slightly High' ||
                 hba1cStatus === 'Borderline High' || fastingGlucoseStatus === 'Borderline High' || ppGlucoseStatus === 'Borderline High') {
        analysis = 'Elevated glucose levels (Fasting, Postprandial, and/or HbA1c) are strongly suggestive of prediabetes or diabetes. HbA1c of 6.5% or higher typically indicates diabetes (WHO criteria). This requires immediate attention and lifestyle intervention.';
        suggestion = 'Adopt a strict low-sugar, low-refined carbohydrate diet. Prioritize whole grains, lean proteins, and plenty of non-starchy vegetables. Engage in regular, consistent exercise (at least 150 minutes of moderate-intensity aerobic activity per week and strength training). Achieve and maintain a healthy weight. Monitor your blood sugar levels as advised by your doctor.';
        prescription = 'Consult an endocrinologist or diabetologist for diagnosis confirmation and a personalized management plan. This may include intensive lifestyle modifications, and if necessary, initiation of oral medications (e.g., metformin) or insulin therapy. Regular follow-up and glucose monitoring are crucial for preventing complications.';
      } else {
        analysis = 'Minor deviations in blood glucose parameters. These warrant close monitoring and proactive lifestyle modifications to prevent progression to prediabetes or diabetes.';
        suggestion = 'Monitor dietary intake of sugars and refined carbohydrates. Increase physical activity gradually. Consider portion control.';
        prescription = 'Discuss these results with your doctor for early intervention strategies and potential follow-up tests like a Glucose Tolerance Test.';
      }

    } else if (fileName.includes('electrolyte')) {
      reportType = 'Electrolyte Panel';
      extractedData = {
        'Sodium': { value: 132, unit: 'mEq/L', normalRange: '135-145', status: getStatus(132, 135, 145) },
        'Potassium': { value: 5.5, unit: 'mEq/L', normalRange: '3.5-5.1', status: getStatus(5.5, 3.5, 5.1) },
        'Chloride': { value: 95, unit: 'mEq/L', normalRange: '98-106', status: getStatus(95, 98, 106) },
        'Bicarbonate': { value: 20, unit: 'mEq/L', normalRange: '22-29', status: getStatus(20, 22, 29) },
        'Calcium': { value: 9.0, unit: 'mg/dL', normalRange: '8.5-10.2', status: getStatus(9.0, 8.5, 10.2) },
        'Magnesium': { value: 2.0, unit: 'mg/dL', normalRange: '1.7-2.2', status: getStatus(2.0, 1.7, 2.2) },
        'Phosphate': { value: 3.5, unit: 'mg/dL', normalRange: '2.5-4.5', status: getStatus(3.5, 2.5, 4.5) },
      };

      const sodiumStatus = extractedData['Sodium'].status;
      const potassiumStatus = extractedData['Potassium'].status;
      const chlorideStatus = extractedData['Chloride'].status;
      const bicarbonateStatus = extractedData['Bicarbonate'].status;

      if (sodiumStatus === 'Normal' && potassiumStatus === 'Normal' && chlorideStatus === 'Normal' && bicarbonateStatus === 'Normal') {
        analysis = 'Electrolyte levels are generally balanced, indicating proper fluid and acid-base balance in the body.';
        suggestion = 'Maintain adequate hydration by drinking plenty of water. Follow a balanced diet to ensure sufficient intake of essential minerals.';
        prescription = 'No specific medication required. Continue routine care.';
      } else if (sodiumStatus === 'Low' || sodiumStatus === 'High' || sodiumStatus === 'Critical Low' || sodiumStatus === 'Critical High') {
        analysis = `Abnormal sodium levels (${sodiumStatus}) indicate a significant fluid or electrolyte imbalance, which can be serious and affect brain function.`;
        suggestion = 'Ensure proper fluid intake, but avoid over-hydration (if low sodium) or severe dehydration (if high sodium). Do not self-medicate with salt or excessive fluids.';
        prescription = 'Consult a doctor immediately for evaluation and management of sodium imbalance. This is a critical finding that requires prompt medical intervention to prevent complications. Further tests may be needed to identify the underlying cause.';
      } else if (potassiumStatus === 'Low' || potassiumStatus === 'High' || potassiumStatus === 'Critical Low' || potassiumStatus === 'Critical High') {
        analysis = `Abnormal potassium levels (${potassiumStatus}) can significantly affect heart function, muscle activity, and nerve signals. This is a potentially serious finding.`;
        suggestion = 'Avoid foods extremely high or low in potassium without medical advice. Monitor for symptoms like muscle weakness, cramps, or irregular heartbeat.';
        prescription = 'Seek urgent medical attention for evaluation and correction of potassium imbalance. This can be serious and requires professional management, potentially including intravenous fluids or medications.';
      } else if (chlorideStatus === 'Low' || chlorideStatus === 'High' || bicarbonateStatus === 'Low' || bicarbonateStatus === 'High') {
        analysis = 'Deviations in chloride or bicarbonate suggest an acid-base imbalance in the body, which can be related to kidney function, respiratory issues, or metabolic conditions.';
        suggestion = 'Monitor for symptoms like changes in breathing, fatigue, or confusion. Maintain good hydration.';
        prescription = 'Consult a doctor for further investigation into the acid-base imbalance. Management will target the underlying cause.';
      } else {
        analysis = 'Some electrolyte levels show minor deviations. These warrant attention to prevent more significant imbalances.';
        suggestion = 'Review fluid intake and dietary habits. Avoid excessive use of diuretics or laxatives without medical supervision.';
        prescription = 'Discuss these results with your doctor to understand the implications and any necessary interventions. Follow-up electrolyte panel may be recommended.';
      }

    } else if (fileName.includes('vitamin d')) {
      reportType = 'Vitamin D Panel';
      extractedData = {
        'Vitamin D (25-OH)': { value: 15, unit: 'ng/mL', normalRange: '30-100', status: getStatus(15, 30, 100) }, // Deficiency <20, Insufficiency 20-29
      };

      const vitDStatus = extractedData['Vitamin D (25-OH)'].status;

      if (vitDStatus === 'Normal') {
        analysis = 'Your Vitamin D levels are optimal, supporting healthy bones, immune function, and overall well-being.';
        suggestion = 'Continue a balanced diet and regular, safe sun exposure (10-30 minutes mid-day, depending on skin type and location, without sunscreen).';
        prescription = 'No specific medication required. Annual Vitamin D check recommended, especially in regions with limited sunlight.';
      } else if (vitDStatus === 'Low' || vitDStatus === 'Critical Low') {
        analysis = 'Significant Vitamin D deficiency detected. This can impact bone health (osteoporosis, osteomalacia), immune function, and may be linked to other health issues.';
        suggestion = 'Increase safe sun exposure. Incorporate Vitamin D rich foods like fatty fish (salmon, mackerel), fortified dairy products, and eggs into your diet.';
        prescription = 'Consult a doctor for Vitamin D supplementation. Dosage (e.g., Vitamin D3 1000-5000 IU daily or weekly high-dose) will depend on the severity of deficiency and individual needs. Follow-up Vitamin D levels in 3-6 months after starting supplementation.';
      } else if (vitDStatus === 'Slightly Low' || vitDStatus === 'Borderline Low') {
        analysis = 'Vitamin D levels are insufficient or borderline low. While not severely deficient, these levels may not be optimal for long-term health.';
        suggestion = 'Focus on increasing dietary sources of Vitamin D and consistent, safe sun exposure. Consider a low-dose daily supplement if dietary and sun exposure are inadequate.';
        prescription = 'Discuss with your doctor for advice on low-dose supplementation (e.g., 800-2000 IU daily) if needed. Regular monitoring is advisable.';
      } else if (vitDStatus === 'High' || vitDStatus === 'Elevated') {
        analysis = 'Elevated Vitamin D levels. While rare from diet or sun, excessive supplementation can lead to toxicity (hypercalcemia).';
        suggestion = 'Review all supplements you are taking. Reduce or stop Vitamin D supplementation under medical guidance.';
        prescription = 'Consult a doctor to investigate the cause of high Vitamin D and manage any associated symptoms (e.g., high calcium).';
      } else {
        analysis = 'Vitamin D levels show minor deviations. Further evaluation may be needed.';
        suggestion = 'Review dietary intake and any supplements. Discuss with your doctor.';
        prescription = 'Follow-up as advised by your healthcare provider.';
      }

    } else if (fileName.includes('iron')) {
      reportType = 'Iron Studies';
      extractedData = {
        'Serum Iron': { value: 40, unit: 'μg/dL', normalRange: '60-170', status: getStatus(40, 60, 170) },
        'Ferritin': { value: 8, unit: 'ng/mL', normalRange: '15-150', status: getStatus(8, 15, 150) },
        'TIBC': { value: 480, unit: 'μg/dL', normalRange: '240-450', status: getStatus(480, 240, 450) },
        'Transferrin Saturation': { value: 10, unit: '%', normalRange: '20-50', status: getStatus(10, 20, 50) },
      };

      const serumIronStatus = extractedData['Serum Iron'].status;
      const ferritinStatus = extractedData['Ferritin'].status;
      const tibcStatus = extractedData['TIBC'].status;
      const transferrinSatStatus = extractedData['Transferrin Saturation'].status;

      if (serumIronStatus === 'Normal' && ferritinStatus === 'Normal' && tibcStatus === 'Normal' && transferrinSatStatus === 'Normal') {
        analysis = 'Iron study parameters are all within normal limits, indicating healthy iron stores and metabolism.';
        suggestion = 'Maintain a balanced diet rich in iron-containing foods. No specific action required.';
        prescription = 'No medication required. Routine check-up as advised.';
      } else if (ferritinStatus === 'Low' || serumIronStatus === 'Low' || transferrinSatStatus === 'Low') {
        analysis = 'Low ferritin (iron stores) and/or low serum iron/transferrin saturation suggest iron deficiency, which can lead to iron deficiency anemia. Symptoms include fatigue, weakness, and pallor.';
        suggestion = 'Increase intake of iron-rich foods (heme iron from red meat, poultry, fish; non-heme iron from beans, lentils, spinach, fortified cereals). Consume Vitamin C with iron-rich foods to enhance absorption. Avoid tea/coffee with meals.';
        prescription = 'Consult a doctor for iron supplementation (e.g., ferrous sulfate) and to identify the underlying cause of iron deficiency (e.g., chronic blood loss, malabsorption). Follow-up iron studies and CBC in 1-3 months to monitor response to treatment.';
      } else if (ferritinStatus === 'High' || serumIronStatus === 'High' || tibcStatus === 'Low') {
        analysis = 'Elevated iron levels (ferritin, serum iron) or low TIBC can indicate iron overload, which can be harmful to organs (e.g., hemochromatosis).';
        suggestion = 'Avoid iron supplements and iron-fortified foods. Do not consume alcohol as it can worsen iron overload.';
        prescription = 'Consult a hematologist for diagnosis and management of iron overload (e.g., therapeutic phlebotomy). Further genetic testing may be recommended.';
      } else {
        analysis = 'Minor deviations in iron studies. Further evaluation may be needed.';
        suggestion = 'Review dietary iron intake. Discuss with your doctor.';
        prescription = 'Follow-up as advised by your healthcare provider.';
      }

    } else if (fileName.includes('urine')) {
      reportType = 'Urine Routine Analysis';
      extractedData = {
        'Appearance': { value: 'Turbid', unit: '', normalRange: 'Clear', status: 'High' }, // Turbid usually means abnormal
        'pH': { value: 8.5, unit: '', normalRange: '4.5-8.0', status: getStatus(8.5, 4.5, 8.0) },
        'Specific Gravity': { value: 1.030, unit: '', normalRange: '1.005-1.030', status: getStatus(1.030, 1.005, 1.030) },
        'Protein': { value: 'Trace', unit: '', normalRange: 'Negative', status: 'Elevated' },
        'Glucose': { value: 'Positive', unit: '', normalRange: 'Negative', status: 'High' },
        'Leukocytes': { value: 'Positive', unit: '', normalRange: 'Negative', status: 'High' },
        'Nitrite': { value: 'Positive', unit: '', normalRange: 'Negative', status: 'High' },
        'Blood': { value: 'Trace', unit: '', normalRange: 'Negative', status: 'Elevated' },
        'Ketones': { value: 'Negative', unit: '', normalRange: 'Negative', status: 'Normal' },
        'Bilirubin': { value: 'Negative', unit: '', normalRange: 'Negative', status: 'Normal' },
        'Urobilinogen': { value: 'Normal', unit: '', normalRange: 'Normal', status: 'Normal' },
      };

      const proteinStatus = extractedData['Protein'].status;
      const glucoseStatus = extractedData['Glucose'].status;
      const leukocytesStatus = extractedData['Leukocytes'].status;
      const nitriteStatus = extractedData['Nitrite'].status;

      if (proteinStatus === 'Normal' && glucoseStatus === 'Normal' && leukocytesStatus === 'Normal' && nitriteStatus === 'Normal' && extractedData['Appearance'].value === 'Clear') {
        analysis = 'Urine routine analysis is within normal parameters, suggesting no active infection, uncontrolled diabetes, or significant kidney issues.';
        suggestion = 'Maintain good hydration and personal hygiene. Drink plenty of water throughout the day.';
        prescription = 'No specific medication required. Routine check-up as advised.';
      } else if (leukocytesStatus === 'High' || nitriteStatus === 'High' || extractedData['Appearance'].value === 'Turbid') {
        analysis = 'Presence of leukocytes and/or nitrites, or turbid appearance, strongly suggests a urinary tract infection (UTI).';
        suggestion = 'Drink plenty of water to help flush out bacteria. Avoid holding urine for prolonged periods. Practice good personal hygiene, especially after bowel movements.';
        prescription = 'Consult a doctor promptly for diagnosis and antibiotic treatment for UTI. A urine culture may be needed to identify the specific bacteria and guide antibiotic choice.';
      } else if (glucoseStatus === 'High' && proteinStatus === 'Normal') {
        analysis = 'Glucose detected in urine. This often indicates very high blood sugar levels (e.g., uncontrolled diabetes) or a rare condition called renal glycosuria where kidneys leak glucose.';
        suggestion = 'Monitor blood sugar levels closely (fasting, post-meal). Follow a strict low-sugar, low-refined carbohydrate diet. Increase physical activity.';
        prescription = 'Consult a doctor or endocrinologist for further evaluation of blood sugar control. May require adjustments to diabetes management or investigation for renal glycosuria.';
      } else if (proteinStatus === 'Elevated' || extractedData['Blood'].status === 'Elevated') {
        analysis = 'Presence of protein (proteinuria) or blood (hematuria) in urine. This can indicate kidney damage, infection, kidney stones, or other urinary tract issues. It requires investigation.';
        suggestion = 'Maintain good hydration. Avoid excessive protein intake without medical advice. Monitor for symptoms like swelling, foamy urine, or pain during urination.';
        prescription = 'Consult a doctor or nephrologist for further investigation to determine the cause of proteinuria or hematuria. Further tests like kidney function tests, imaging (ultrasound, CT scan), or kidney biopsy may be required.';
      } else if (extractedData['pH'].status !== 'Normal') {
        analysis = `Urine pH is abnormal (${extractedData['pH'].status}). This can be influenced by diet, medications, or metabolic conditions, and can affect kidney stone formation.`;
        suggestion = 'Review your diet. Ensure balanced intake of fruits and vegetables. Discuss with your doctor.';
        prescription = 'Consult a doctor to understand the implications of abnormal urine pH and any necessary dietary or medical adjustments.';
      } else {
        analysis = 'Minor abnormalities in urine analysis. These warrant attention and may indicate early issues or specific dietary influences.';
        suggestion = 'Review fluid intake and hygiene practices. Note any new symptoms.';
        prescription = 'Discuss with your doctor for further advice and potential follow-up urine tests.';
      }

    } else if (fileName.includes('cardiac marker')) {
      reportType = 'Cardiac Marker Panel';
      extractedData = {
        'Troponin I': { value: 0.08, unit: 'ng/mL', normalRange: '<0.04', status: getStatus(0.08, 0, 0.04) },
        'CK-MB': { value: 6.5, unit: 'ng/mL', normalRange: '0-4.3', status: getStatus(6.5, 0, 4.3) },
        'BNP': { value: 150, unit: 'pg/mL', normalRange: '<100', status: getStatus(150, 0, 100) },
        'hs-CRP': { value: 4.5, unit: 'mg/L', normalRange: '<1.0', status: getStatus(4.5, 0, 1.0) }, // High sensitivity CRP for cardiac risk
        'NT-proBNP': { value: 200, unit: 'pg/mL', normalRange: '<125', status: getStatus(200, 0, 125) }, // Another heart failure marker
      };

      const troponinStatus = extractedData['Troponin I'].status;
      const ckmbStatus = extractedData['CK-MB'].status;
      const bnpStatus = extractedData['BNP'].status;
      const hsCrpStatus = extractedData['hs-CRP'].status;

      if (troponinStatus === 'Normal' && ckmbStatus === 'Normal' && bnpStatus === 'Normal' && hsCrpStatus === 'Normal') {
        analysis = 'Cardiac markers are within normal limits, suggesting no acute cardiac injury or significant inflammation-related cardiac risk.';
        suggestion = 'Maintain a heart-healthy lifestyle with regular exercise (at least 150 minutes of moderate aerobic activity per week), a balanced diet low in saturated/trans fats, and stress management.';
        prescription = 'No specific medication required. Routine cardiac check-up as advised, especially if you have other cardiovascular risk factors.';
      } else if (troponinStatus === 'High' || troponinStatus === 'Critical High' || ckmbStatus === 'High' || ckmbStatus === 'Critical High') {
        analysis = 'Elevated Troponin I or CK-MB indicates acute cardiac muscle damage, highly suggestive of a heart attack (myocardial infarction) or acute coronary syndrome. This is a medical emergency.';
        suggestion = 'IMMEDIATELY seek emergency medical attention. Call your local emergency number (e.g., 911) or go to the nearest emergency room without delay. Do not drive yourself.';
        prescription = 'Emergency medical intervention is required. This is a critical finding that needs immediate professional medical care.';
      } else if (bnpStatus === 'High' || bnpStatus === 'Elevated' || extractedData['NT-proBNP'].status === 'High') {
        analysis = 'Elevated BNP or NT-proBNP suggests possible heart failure or other significant cardiac stress. These markers are released when the heart is stretched or overworked.';
        suggestion = 'Monitor for symptoms like shortness of breath (especially with exertion or lying flat), swelling in legs/ankles, and unusual fatigue. Limit sodium intake and fluid consumption as advised by a doctor.';
        prescription = 'Consult a cardiologist for further evaluation and management of heart failure. This may involve additional tests (e.g., echocardiogram) and medications to improve heart function and manage symptoms. Regular follow-up is essential.';
      } else if (hsCrpStatus === 'High' || hsCrpStatus === 'Elevated') {
        analysis = 'Elevated high-sensitivity C-Reactive Protein (hs-CRP) indicates systemic inflammation and is an independent risk factor for cardiovascular disease, even with normal cholesterol levels.';
        suggestion = 'Adopt an anti-inflammatory diet rich in fruits, vegetables, whole grains, and omega-3 fatty acids. Increase physical activity. Manage stress. Address any underlying sources of inflammation.';
        prescription = 'Consult your doctor to discuss your cardiovascular risk and potential strategies to lower hs-CRP. This may involve lifestyle changes or, in some cases, medication.';
      } else {
        analysis = 'Some cardiac markers show minor deviations. These warrant medical review and attention to cardiovascular health.';
        suggestion = 'Focus on heart-healthy habits. Discuss these findings with your doctor.';
        prescription = 'Consult your doctor for further assessment and risk stratification based on your complete medical profile.';
      }

    } else if (fileName.includes('thyroid antibodies')) {
      reportType = 'Thyroid Antibody Panel';
      extractedData = {
        'Anti-TPO Antibodies': { value: 150, unit: 'IU/mL', normalRange: '<35', status: getStatus(150, 0, 35) },
        'Thyroglobulin Antibodies': { value: 80, unit: 'IU/mL', normalRange: '<20', status: getStatus(80, 0, 20) },
        'TSH Receptor Antibodies (TRAb)': { value: 1.5, unit: 'IU/L', normalRange: '<1.75', status: getStatus(1.5, 0, 1.75) }, // For Graves' disease
      };

      const antiTPOStatus = extractedData['Anti-TPO Antibodies'].status;
      const thyroglobulinAbStatus = extractedData['Thyroglobulin Antibodies'].status;
      const trabStatus = extractedData['TSH Receptor Antibodies (TRAb)'].status;

      if (antiTPOStatus === 'Normal' && thyroglobulinAbStatus === 'Normal' && trabStatus === 'Normal') {
        analysis = 'Thyroid antibody levels are normal, suggesting no autoimmune thyroid disease.';
        suggestion = 'No specific action needed based on these results. Continue routine health monitoring.';
        prescription = 'Routine check-up as advised.';
      } else if (antiTPOStatus === 'High' && thyroglobulinAbStatus !== 'High') {
        analysis = 'Elevated Anti-TPO antibodies are highly indicative of Hashimoto\'s thyroiditis, an autoimmune condition causing an underactive thyroid. Your body is attacking its own thyroid gland.';
        suggestion = 'Monitor for symptoms of hypothyroidism (fatigue, weight gain, cold intolerance, dry skin). Ensure adequate selenium and zinc intake, which support thyroid health.';
        prescription = 'Consult an endocrinologist for diagnosis and management of Hashimoto\'s thyroiditis. Regular monitoring of thyroid function (TSH, Free T4) is essential, even if currently normal, as hypothyroidism often develops over time. Treatment typically involves thyroid hormone replacement.';
      } else if (thyroglobulinAbStatus === 'High' && antiTPOStatus !== 'High') {
        analysis = 'Elevated Thyroglobulin antibodies. While less specific than Anti-TPO, they can also indicate autoimmune thyroid disease or be elevated after thyroid damage/inflammation.';
        suggestion = 'Monitor for any thyroid-related symptoms. Ensure adequate iodine intake from diet, but avoid excessive amounts.';
        prescription = 'Consult an endocrinologist for further evaluation. Correlation with thyroid function tests (TSH, T3, T4) is important.';
      } else if (antiTPOStatus === 'High' && thyroglobulinAbStatus === 'High') {
        analysis = 'Both Anti-TPO and Thyroglobulin antibodies are elevated, strongly confirming autoimmune thyroid disease, most commonly Hashimoto\'s thyroiditis.';
        suggestion = 'Follow advice for elevated Anti-TPO antibodies.';
        prescription = 'Follow advice for elevated Anti-TPO antibodies, with a strong recommendation for endocrinologist consultation and regular thyroid function monitoring.';
      } else if (trabStatus === 'High') {
        analysis = 'Elevated TSH Receptor Antibodies (TRAb) are highly specific for Graves\' disease, an autoimmune condition causing an overactive thyroid (hyperthyroidism).';
        suggestion = 'Monitor for symptoms of hyperthyroidism (weight loss, palpitations, anxiety, heat intolerance, tremors).';
        prescription = 'Consult an endocrinologist immediately for diagnosis and management of Graves\' disease. Treatment options include anti-thyroid medications, radioactive iodine therapy, or surgery.';
      } else {
        analysis = 'Thyroid antibody results show minor deviations or an unclear pattern. Clinical correlation is advised.';
        suggestion = 'Discuss with your doctor if you have any thyroid-related symptoms or a family history of thyroid disease.';
        prescription = 'Follow-up with thyroid function tests as recommended by your healthcare provider.';
      }

    } else if (fileName.includes('liver fibrosis')) {
      reportType = 'Liver Fibrosis Panel';
      extractedData = {
        'FibroScan Score': { value: 8.5, unit: 'kPa', normalRange: '<7.0', status: getStatus(8.5, 0, 7.0) }, // Higher values indicate more fibrosis
        'APRI Score': { value: 1.2, unit: '', normalRange: '<0.5', status: getStatus(1.2, 0, 0.5) }, // Higher values indicate more fibrosis
        'FIB-4 Score': { value: 2.1, unit: '', normalRange: '<1.45', status: getStatus(2.1, 0, 1.45) }, // Higher values indicate more fibrosis
        'Platelet Count': { value: 180, unit: 'x10^9/L', normalRange: '150-450', status: getStatus(180, 150, 450) }, // Used in APRI/FIB-4
        'AST (SGOT)': { value: 45, unit: 'U/L', normalRange: '5-40', status: getStatus(45, 5, 40) }, // Used in APRI/FIB-4
        'ALT (SGPT)': { value: 55, unit: 'U/L', normalRange: '7-56', status: getStatus(55, 7, 56) }, // Used in FIB-4
      };

      const fibroScanStatus = extractedData['FibroScan Score'].status;
      const apriStatus = extractedData['APRI Score'].status;
      const fib4Status = extractedData['FIB-4 Score'].status;

      if (fibroScanStatus === 'Normal' && apriStatus === 'Normal' && fib4Status === 'Normal') {
        analysis = 'Liver fibrosis markers are within normal limits, suggesting no significant liver scarring or advanced fibrosis.';
        suggestion = 'Maintain a healthy liver by avoiding excessive alcohol, limiting processed foods and unhealthy fats, and managing underlying conditions like diabetes or obesity.';
        prescription = 'No specific medication required. Routine check-up as advised.';
      } else if (fibroScanStatus === 'High' || apriStatus === 'High' || fib4Status === 'High' ||
                 fibroScanStatus === 'Elevated' || apriStatus === 'Elevated' || fib4Status === 'Elevated') {
        analysis = 'Elevated fibrosis scores (FibroScan, APRI, FIB-4) strongly suggest the presence of liver fibrosis or scarring. This indicates ongoing liver damage and warrants immediate attention to prevent progression to cirrhosis.';
        suggestion = 'Strictly avoid alcohol. Aggressively manage underlying causes of liver disease (e.g., viral hepatitis, non-alcoholic fatty liver disease, autoimmune hepatitis). Maintain a healthy weight and balanced diet. Avoid liver-toxic medications.';
        prescription = 'Consult a gastroenterologist or hepatologist for further evaluation and management of liver fibrosis. Additional imaging (e.g., advanced ultrasound, MRI elastography) or liver biopsy may be considered to stage the fibrosis. Regular monitoring and targeted treatment of the underlying liver disease are crucial.';
      } else {
        analysis = 'Minor deviations in liver fibrosis markers. These warrant attention and may indicate early stages of liver damage or risk.';
        suggestion = 'Review lifestyle factors impacting liver health, especially alcohol consumption and diet. Discuss with your doctor.';
        prescription = 'Follow-up with liver function tests and fibrosis markers as advised by your healthcare provider. Consider specialist consultation.';
      }

    } else if (fileName.includes('CRP') || fileName.includes('inflammation')) {
      reportType = 'Inflammation Marker (CRP)';
      extractedData = {
        'C-Reactive Protein (CRP)': { value: 12.0, unit: 'mg/L', normalRange: '<5.0', status: getStatus(12.0, 0, 5.0) },
        'ESR (Erythrocyte Sedimentation Rate)': { value: 30, unit: 'mm/hr', normalRange: '0-20', status: getStatus(30, 0, 20) },
        'Procalcitonin': { value: 0.8, unit: 'ng/mL', normalRange: '<0.1', status: getStatus(0.8, 0, 0.1) }, // Marker for bacterial infection
      };

      const crpStatus = extractedData['C-Reactive Protein (CRP)'].status;
      const esrStatus = extractedData['ESR (Erythrocyte Sedimentation Rate)'].status;
      const procalcitoninStatus = extractedData['Procalcitonin'].status;

      if (crpStatus === 'Normal' && esrStatus === 'Normal' && procalcitoninStatus === 'Normal') {
        analysis = 'Inflammation markers are within normal limits, suggesting no significant active inflammation or infection.';
        suggestion = 'Maintain a healthy lifestyle. No specific action required based on these results.';
        prescription = 'No medication required. Routine check-up as advised.';
      } else if (crpStatus === 'High' || esrStatus === 'High' || procalcitoninStatus === 'High') {
        analysis = 'Elevated CRP and/or ESR indicate systemic inflammation. High Procalcitonin is highly suggestive of a bacterial infection. These findings require investigation.';
        suggestion = 'Monitor for symptoms of infection (fever, localized pain, swelling) or other inflammatory signs. Ensure adequate rest and nutrition. Avoid self-medicating with anti-inflammatory drugs without medical advice.';
        prescription = 'Consult a doctor promptly for further investigation to identify the cause of inflammation/infection. This may involve additional tests (e.g., cultures, imaging) and specific treatment (e.g., antibiotics for bacterial infection, anti-inflammatory drugs for inflammatory conditions).';
      } else {
        analysis = 'Minor elevations in inflammation markers. These warrant medical review.';
        suggestion = 'Review any recent illnesses, injuries, or chronic conditions. Discuss with your doctor.';
        prescription = 'Follow-up as advised by your healthcare provider to monitor inflammation levels.';
      }

    } else if (fileName.includes('vitamin b12')) {
      reportType = 'Vitamin B12 Panel';
      extractedData = {
        'Vitamin B12': { value: 180, unit: 'pg/mL', normalRange: '200-900', status: getStatus(180, 200, 900) },
        'Folate': { value: 8.0, unit: 'ng/mL', normalRange: '3.1-17.0', status: getStatus(8.0, 3.1, 17.0) },
        'Methylmalonic Acid (MMA)': { value: 0.5, unit: 'μmol/L', normalRange: '0.08-0.38', status: getStatus(0.5, 0.08, 0.38) }, // Elevated in B12 deficiency
        'Homocysteine': { value: 15, unit: 'μmol/L', normalRange: '5-15', status: getStatus(15, 5, 15) }, // Elevated in B12/Folate deficiency
      };

      const b12Status = extractedData['Vitamin B12'].status;
      const folateStatus = extractedData['Folate'].status;
      const mmaStatus = extractedData['Methylmalonic Acid (MMA)'].status;
      const homocysteineStatus = extractedData['Homocysteine'].status;

      if (b12Status === 'Normal' && folateStatus === 'Normal' && mmaStatus === 'Normal' && homocysteineStatus === 'Normal') {
        analysis = 'Vitamin B12 and Folate levels are within the healthy range, indicating adequate levels of these essential vitamins.';
        suggestion = 'Maintain a balanced diet, especially if vegetarian or vegan, ensuring adequate intake of fortified foods or supplements as needed.';
        prescription = 'No specific medication required. Routine check-up as advised.';
      } else if (b12Status === 'Low' || mmaStatus === 'High' || homocysteineStatus === 'High') {
        analysis = 'Vitamin B12 deficiency detected. This can lead to megaloblastic anemia, nerve damage, fatigue, and cognitive issues. Elevated MMA is a more sensitive indicator of B12 deficiency.';
        suggestion = 'Increase intake of B12-rich foods (meat, fish, dairy, fortified cereals). If vegetarian/vegan, ensure regular intake of fortified foods or supplements. Monitor for neurological symptoms (numbness, tingling).';
        prescription = 'Consult a doctor for Vitamin B12 supplementation (oral high-dose or injections, depending on severity and cause) and to identify the cause of deficiency (e.g., malabsorption, dietary). Follow-up B12 levels and clinical symptoms after treatment.';
      } else if (folateStatus === 'Low' || homocysteineStatus === 'High') {
        analysis = 'Folate deficiency detected. This can also lead to megaloblastic anemia and elevated homocysteine, which is a risk factor for cardiovascular disease.';
        suggestion = 'Increase intake of folate-rich foods (leafy green vegetables, legumes, fortified grains).';
        prescription = 'Consult a doctor for Folic Acid supplementation and to identify the cause of deficiency. Follow-up folate levels after treatment.';
      } else if (b12Status === 'High') {
        analysis = 'Elevated Vitamin B12 levels. While less common, very high levels can sometimes indicate underlying liver disease, kidney failure, certain blood disorders (e.g., myeloproliferative neoplasms), or excessive supplementation.';
        suggestion = 'Review your diet and any supplements you are taking. Avoid excessive intake of B12 supplements. Monitor for any new symptoms.';
        prescription = 'Consult a doctor for further investigation to determine the cause of elevated B12. No immediate treatment is usually required unless an underlying condition is found, which would then be managed.';
      } else {
        analysis = 'Minor deviations in Vitamin B12 or Folate levels. Further evaluation may be needed.';
        suggestion = 'Review dietary intake and any supplements. Discuss with your doctor.';
        prescription = 'Follow-up as advised by your healthcare provider.';
      }

    } else if (fileName.includes('blood glucose')) {
      reportType = 'Blood Glucose';
      extractedData = {
        'Fasting Glucose': { value: 110, unit: 'mg/dL', normalRange: '70-100', status: getStatus(110, 70, 100) },
        'Random Glucose': { value: 180, unit: 'mg/dL', normalRange: '<140', status: getStatus(180, 0, 140) },
        '2-hour Post Glucose Load': { value: 160, unit: 'mg/dL', normalRange: '<140', status: getStatus(160, 0, 140) }, // For GTT
      };

      const fastingStatus = extractedData['Fasting Glucose'].status;
      const randomStatus = extractedData['Random Glucose'].status;
      const postLoadStatus = extractedData['2-hour Post Glucose Load']?.status || 'Normal'; // Handle if not present

      if (fastingStatus === 'Normal' && randomStatus === 'Normal' && postLoadStatus === 'Normal') {
        analysis = 'Blood glucose levels (Fasting, Random, and Post-load if applicable) are within normal range, indicating good blood sugar control.';
        suggestion = 'Maintain a healthy diet with balanced carbohydrate intake and regular physical activity. Avoid excessive consumption of sugary drinks and processed foods.';
        prescription = 'No specific medication required. Routine annual check-up recommended, especially if there is a family history of diabetes or other risk factors.';
      } else if (fastingStatus === 'High' || randomStatus === 'High' || postLoadStatus === 'High' ||
                 fastingStatus === 'Elevated' || randomStatus === 'Elevated' || postLoadStatus === 'Elevated' ||
                 fastingStatus === 'Slightly High' || randomStatus === 'Slightly High' || postLoadStatus === 'Slightly High' ||
                 fastingStatus === 'Borderline High' || randomStatus === 'Borderline High' || postLoadStatus === 'Borderline High') {
        analysis = 'Elevated blood glucose levels (Fasting, Random, or 2-hour Post-load) are strongly suggestive of prediabetes or diabetes. These indicate impaired glucose regulation and increased risk for complications.';
        suggestion = 'Adopt a strict low-sugar, low-refined carbohydrate diet. Prioritize whole grains, lean proteins, and plenty of non-starchy vegetables. Engage in regular, consistent exercise (at least 150 minutes of moderate-intensity aerobic activity per week and strength training). Achieve and maintain a healthy weight. Monitor your blood sugar levels as advised by your doctor.';
        prescription = 'Consult an endocrinologist or diabetologist for diagnosis confirmation and a personalized management plan. This may include intensive lifestyle modifications, and if necessary, initiation of oral medications (e.g., metformin) or insulin therapy. Regular follow-up and glucose monitoring are crucial for preventing complications.';
      } else {
        analysis = 'Minor deviations in blood glucose. These warrant attention and proactive lifestyle modifications to prevent progression.';
        suggestion = 'Monitor dietary intake of sugars and carbohydrates. Increase physical activity gradually. Consider portion control.';
        prescription = 'Discuss with your doctor for further advice and potential follow-up tests like an HbA1c or Glucose Tolerance Test.';
      }
    }
    else {
      // Fallback for unrecognized reports
      setLoading(false);
      throw new Error('Unsupported report type. Please upload a recognized medical report (e.g., "cbc.pdf", "lipid.txt", "thyroid.docx").');
    }

    setLoading(false);

    return {
      id: `${Date.now()}`,
      userId: user?.id || 'guest',
      fileName: file.name,
      reportType,
      extractedData,
      analysis,
      suggestion,
      prescription,
      uploadDate: new Date(),
    };
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setLoading(true); // Set loading true at the start of the upload process
      setError(null);    // Clear any previous errors
      const newReport = await processFileUpload(file);
      setReports((prev) => [newReport, ...prev]);
    } catch (err) {
      // Error already set in processFileUpload if it's an unsupported type
      // Or set here if processFileUpload fails for other reasons
      if (!error) { // Only set error if not already set by processFileUpload
        setError((err as Error).message || 'Failed to analyze the report.');
      }
    } finally {
      setLoading(false);
      e.target.value = ''; // Clear the input so the same file can be uploaded again
    }
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id));
  };

  const handleDownloadReportPDF = async (reportId: string, reportName: string) => {
    // The content to be exported needs to be wrapped in an element with a unique ID
    // We'll assume the report card itself has an ID based on its report.id
    await PDFExportUtil.generatePDF(`report-card-${reportId}`, `${reportName}_Report`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            <FlaskConical className="inline-block h-10 w-10 text-purple-600 mr-3" />
            Medical Report Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your medical reports for AI-powered analysis, suggestions, and recommendations.
          </p>
          <p className="text-sm text-yellow-700 mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="inline-block h-4 w-4 mr-2 text-yellow-600" />
            Disclaimer: This analysis is AI-generated and for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center">
          <label
            htmlFor="file-upload"
            className={`relative cursor-pointer bg-blue-50 border-2 border-dashed ${
              loading ? 'border-gray-300' : 'border-blue-300 hover:border-blue-500'
            } rounded-xl p-10 w-full max-w-lg text-center transition-all duration-300 ease-in-out
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt,.doc,.docx" // Indicate acceptable file types
              onChange={handleFileUpload}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-semibold text-blue-600">Analyzing report...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="h-16 w-16 text-blue-400 mb-4" />
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  Drag & Drop or <span className="text-blue-600">Click to Upload</span>
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, TXT, DOC, DOCX. Max file size: 5MB (simulated).
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Try uploading files like "cbc.pdf", "lipid.txt", "thyroid.docx" for demo.
                </p>
              </div>
            )}
          </label>
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl w-full max-w-lg text-center">
              <XCircle className="inline-block h-5 w-5 mr-2" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Display Reports */}
        {reports.length === 0 && !loading && !error && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
            <FileText className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <p className="text-xl font-semibold text-gray-600">No reports uploaded yet.</p>
            <p className="text-gray-500 mt-2">Upload a medical report to get started with AI analysis.</p>
          </div>
        )}

        {reports.map((report) => (
          <div key={report.id} id={`report-card-${report.id}`} className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Stethoscope className="h-7 w-7 text-green-600 mr-3" />
                  {report.reportType}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Uploaded on: {report.uploadDate.toLocaleString()} | File: {report.fileName}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadReportPDF(report.id, report.reportType)}
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Download PDF"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Delete Report"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Extracted Data Table */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <ClipboardCheck className="h-5 w-5 text-blue-600 mr-2" />
              Extracted Parameters
            </h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-left border-collapse rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Test</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Value</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Unit</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Normal Range</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {Object.entries(report.extractedData).map(([test, data]) => (
                    <tr key={test} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{test}</td>
                      <td className="py-3 px-4 text-gray-700">{data.value}</td>
                      <td className="py-3 px-4 text-gray-700">{data.unit}</td>
                      <td className="py-3 px-4 text-gray-700">{data.normalRange}</td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          data.status === 'Normal' ? 'text-green-600' :
                          data.status.includes('High') ? 'text-red-600' :
                          data.status.includes('Low') ? 'text-orange-600' :
                          'text-gray-600'
                        }`}
                      >
                        {data.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Analysis, Suggestions, Recommendations */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-inner">
                <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                  Analysis:
                </h3>
                <p className="text-blue-800 leading-relaxed">{report.analysis}</p>
              </div>

              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-inner">
                <h3 className="font-bold text-yellow-900 mb-3 text-lg flex items-center">
                  <Stethoscope className="h-5 w-5 text-yellow-600 mr-2" />
                  Suggestions:
                </h3>
                <p className="text-yellow-800 leading-relaxed">{report.suggestion}</p>
              </div>

              <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-inner">
                <h3 className="font-bold text-green-900 mb-3 text-lg flex items-center">
                  <ClipboardCheck className="h-5 w-5 text-green-600 mr-2" />
                  General Recommendations:
                </h3>
                <p className="text-green-800 leading-relaxed">{report.prescription}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportAnalyzer;
