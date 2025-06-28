import React, { useState } from 'react';

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
      status: 'Normal' | 'High' | 'Low' | 'Borderline High' | 'Slightly High' | 'Elevated';
    }
  >;
  analysis: string;
  suggestion: string;
  prescription: string;
  uploadDate: Date;
}

const ReportAnalyzer: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated user
  const user = { id: '1', name: 'Demo User' };

  // Simulated AI analysis based on filename
  const analyzeReport = async (file: File): Promise<MedicalReport> => {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // simulate delay

    const fileName = file.name.toLowerCase();
    let extractedData: any = {};
    let analysis = '';
    let suggestion = '';
    let prescription = '';
    let reportType = '';

    if (fileName.includes('cbc') || fileName.includes('blood')) {
      reportType = 'Complete Blood Count (CBC)';
      extractedData = {
        'Hemoglobin': { value: 12.5, unit: 'g/dL', normalRange: '12.0-16.0', status: 'Normal' },
        'WBC Count': { value: 7200, unit: '/μL', normalRange: '4000-11000', status: 'Normal' },
        'RBC Count': { value: 4.8, unit: 'million/μL', normalRange: '4.2-5.4', status: 'Normal' },
        'Platelet Count': { value: 180000, unit: '/μL', normalRange: '150000-450000', status: 'Normal' },
        'Hematocrit': { value: 41, unit: '%', normalRange: '36-46', status: 'Normal' },
      };
      analysis = 'CBC values are within normal range, indicating healthy blood composition.';
      suggestion = 'Maintain a balanced diet and regular exercise to keep blood health optimal.';
      prescription = 'No medication required. Routine checkup recommended annually.';
    } else if (fileName.includes('lipid') || fileName.includes('cholesterol')) {
      reportType = 'Lipid Profile';
      extractedData = {
        'Total Cholesterol': { value: 210, unit: 'mg/dL', normalRange: '<200', status: 'Borderline High' },
        'LDL Cholesterol': { value: 140, unit: 'mg/dL', normalRange: '<100', status: 'High' },
        'HDL Cholesterol': { value: 35, unit: 'mg/dL', normalRange: '>40', status: 'Low' },
        'Triglycerides': { value: 190, unit: 'mg/dL', normalRange: '<150', status: 'High' },
      };
      analysis = 'High LDL and triglycerides suggest risk of cardiovascular disease. HDL is low.';
      suggestion = 'Adopt a low-fat diet, increase physical activity, and avoid smoking.';
      prescription = 'Consider statins after consulting a cardiologist. Follow-up lipid profile in 3 months.';
    } else if (fileName.includes('kidney') || fileName.includes('creatinine')) {
      reportType = 'Kidney Function Test';
      extractedData = {
        'Creatinine': { value: 1.4, unit: 'mg/dL', normalRange: '0.6-1.2', status: 'Slightly High' },
        'BUN': { value: 24, unit: 'mg/dL', normalRange: '7-20', status: 'High' },
        'eGFR': { value: 55, unit: 'mL/min/1.73m²', normalRange: '>60', status: 'Low' },
        'Protein in Urine': { value: 'Positive', unit: '', normalRange: 'Negative', status: 'High' },
      };
      analysis = 'Kidney function mildly reduced. Elevated BUN and creatinine suggest further evaluation.';
      suggestion = 'Maintain hydration, avoid nephrotoxic drugs, and control blood pressure.';
      prescription = 'Consult nephrologist for detailed assessment. Monitor kidney function every 6 months.';
    } else if (fileName.includes('lft') || fileName.includes('liver')) {
      reportType = 'Liver Function Test';
      extractedData = {
        'ALT (SGPT)': { value: 65, unit: 'U/L', normalRange: '7-56', status: 'High' },
        'AST (SGOT)': { value: 72, unit: 'U/L', normalRange: '5-40', status: 'High' },
        'Bilirubin Total': { value: 1.3, unit: 'mg/dL', normalRange: '0.1-1.2', status: 'Slightly High' },
        'Albumin': { value: 3.5, unit: 'g/dL', normalRange: '3.4-5.4', status: 'Normal' },
      };
      analysis = 'Elevated liver enzymes suggest mild liver stress or fatty liver. Consider ultrasound.';
      suggestion = 'Avoid alcohol, fatty foods, and medications harmful to liver.';
      prescription = 'Liver supportive therapy as advised by doctor. Follow up liver enzymes in 3 months.';
    } else if (fileName.includes('thyroid') || fileName.includes('tsh')) {
      reportType = 'Thyroid Function Test';
      extractedData = {
        'TSH': { value: 6.2, unit: 'μIU/mL', normalRange: '0.4-4.0', status: 'High' },
        'T3': { value: 90, unit: 'ng/dL', normalRange: '80-200', status: 'Normal' },
        'T4': { value: 7.2, unit: 'μg/dL', normalRange: '5.0-12.0', status: 'Normal' },
      };
      analysis = 'High TSH suggests primary hypothyroidism. Clinical symptoms should be reviewed.';
      suggestion = 'Monitor symptoms like fatigue, weight gain, and cold intolerance.';
      prescription = 'Thyroxine replacement therapy as prescribed by endocrinologist.';
    } else if (fileName.includes('hba1c') || fileName.includes('diabetes')) {
      reportType = 'Diabetes Panel';
      extractedData = {
        'Fasting Glucose': { value: 115, unit: 'mg/dL', normalRange: '70-100', status: 'High' },
        'Postprandial Glucose': { value: 165, unit: 'mg/dL', normalRange: '<140', status: 'High' },
        'HbA1c': { value: 6.7, unit: '%', normalRange: '<5.7', status: 'High' },
      };
      analysis = 'Values indicate prediabetes to early diabetes. Lifestyle modification and monitoring advised.';
      suggestion = 'Adopt low sugar diet, regular exercise, and maintain healthy weight.';
      prescription = 'Start metformin if lifestyle changes insufficient. Regular glucose monitoring.';
    } else if (fileName.includes('electrolyte') || fileName.includes('sodium')) {
      reportType = 'Electrolyte Panel';
      extractedData = {
        'Sodium': { value: 136, unit: 'mEq/L', normalRange: '135-145', status: 'Normal' },
        'Potassium': { value: 4.8, unit: 'mEq/L', normalRange: '3.5-5.1', status: 'Normal' },
        'Chloride': { value: 100, unit: 'mEq/L', normalRange: '98-106', status: 'Normal' },
        'Bicarbonate': { value: 24, unit: 'mEq/L', normalRange: '22-29', status: 'Normal' },
      };
      analysis = 'Electrolyte values are within normal range.';
      suggestion = 'Continue balanced diet and hydration.';
      prescription = 'No medication required.';
    } else if (fileName.includes('vitamin')) {
      reportType = 'Vitamin Panel';
      extractedData = {
        'Vitamin D': { value: 19, unit: 'ng/mL', normalRange: '30-100', status: 'Low' },
        'Vitamin B12': { value: 320, unit: 'pg/mL', normalRange: '200-900', status: 'Normal' },
      };
      analysis = 'Vitamin D deficiency detected. Consider supplementation and sun exposure.';
      suggestion = 'Increase outdoor activity for sunlight exposure.';
      prescription = 'Vitamin D3 supplements 1000-2000 IU daily as per doctor’s advice.';
    } else if (fileName.includes('cardiac') || fileName.includes('troponin')) {
      reportType = 'Cardiac Marker Panel';
      extractedData = {
        'Troponin I': { value: 0.02, unit: 'ng/mL', normalRange: '<0.04', status: 'Normal' },
        'CK-MB': { value: 3.1, unit: 'ng/mL', normalRange: '0-4.3', status: 'Normal' },
      };
      analysis = 'No cardiac injury markers detected. Report is normal.';
      suggestion = 'Maintain heart-healthy lifestyle.';
      prescription = 'No medication required.';
    } else if (fileName.includes('iron')) {
      reportType = 'Iron Studies';
      extractedData = {
        'Serum Iron': { value: 45, unit: 'μg/dL', normalRange: '60-170', status: 'Low' },
        'TIBC': { value: 410, unit: 'μg/dL', normalRange: '240-450', status: 'Normal' },
        'Ferritin': { value: 10, unit: 'ng/mL', normalRange: '15-150', status: 'Low' },
      };
      analysis = 'Iron deficiency anemia likely. Iron supplements may be required.';
      suggestion = 'Increase intake of iron-rich foods like spinach, red meat.';
      prescription = 'Iron supplements as prescribed. Follow up CBC in 3 months.';
    } else if (fileName.includes('urine')) {
      reportType = 'Urine Routine Analysis';
      extractedData = {
        'Appearance': { value: 'Clear', unit: '', normalRange: 'Clear', status: 'Normal' },
        'pH': { value: 6.0, unit: '', normalRange: '4.5-8.0', status: 'Normal' },
        'Protein': { value: 'Negative', unit: '', normalRange: 'Negative', status: 'Normal' },
        'Glucose': { value: 'Negative', unit: '', normalRange: 'Negative', status: 'Normal' },
      };
      analysis = 'Urine sample is within expected parameters. No infection or sugar detected.';
      suggestion = 'Maintain hydration and hygiene.';
      prescription = 'No medication required.';
    } else if (fileName.includes('fibrosis')) {
      reportType = 'Liver Fibrosis Panel';
      extractedData = {
        'FibroTest Score': { value: 0.25, unit: '', normalRange: '0-0.21', status: 'Slightly High' },
        'Fibrosis Stage': { value: 'F1', unit: '', normalRange: 'F0-F4', status: 'Normal' },
      };
      analysis = 'Mild liver fibrosis detected, regular monitoring recommended.';
      suggestion = 'Avoid alcohol and hepatotoxic substances.';
      prescription = 'Regular liver function monitoring and lifestyle changes.';
    
    } else {
      // No fallback report, throw error for unsupported
      setLoading(false);
      throw new Error('Unsupported report type. Please upload a recognized medical report.');
    }

    setLoading(false);

    return {
      id: `${Date.now()}`,
      userId: user.id,
      fileName: file.name,
      reportType,
      extractedData,
      analysis,
      suggestion,
      prescription,
      uploadDate: new Date(),
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      const newReport = await analyzeReport(file);
      setReports((prev) => [newReport, ...prev]);
    } catch (err) {
      setError((err as Error).message || 'Failed to analyze the report.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 text-center">Medical Report Analyzer</h1>

      <input
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileUpload}
        disabled={loading}
        className="mb-6"
      />

      {loading && <p className="text-blue-600 font-semibold">Analyzing report, please wait...</p>}

      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {reports.length === 0 && !loading && !error && (
        <p className="italic text-gray-600">No reports uploaded yet.</p>
      )}

      {reports.map((report) => (
        <div key={report.id} className="border rounded-lg p-4 mb-6 shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-2">{report.reportType}</h2>
          <p className="text-sm text-gray-500 mb-4">
            Uploaded on: {report.uploadDate.toLocaleString()} | File: {report.fileName}
          </p>

          <table className="w-full text-left border-collapse mb-4">
            <thead>
              <tr>
                <th className="border-b py-2 px-3">Test</th>
                <th className="border-b py-2 px-3">Value</th>
                <th className="border-b py-2 px-3">Unit</th>
                <th className="border-b py-2 px-3">Normal Range</th>
                <th className="border-b py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.extractedData).map(([test, data]) => (
                <tr key={test}>
                  <td className="border-b py-2 px-3">{test}</td>
                  <td className="border-b py-2 px-3">{data.value}</td>
                  <td className="border-b py-2 px-3">{data.unit}</td>
                  <td className="border-b py-2 px-3">{data.normalRange}</td>
                  <td
                    className={`border-b py-2 px-3 font-semibold ${
                      data.status === 'Normal'
                        ? 'text-green-600'
                        : data.status === 'Low' || data.status === 'Slightly High' || data.status === 'Borderline High'
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}
                  >
                    {data.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-100 p-3 rounded-md mb-2">
            <h3 className="font-semibold mb-1">AI Analysis:</h3>
            <p>{report.analysis}</p>
          </div>

          <div className="bg-yellow-100 p-3 rounded-md mb-2">
            <h3 className="font-semibold mb-1">Suggestions:</h3>
            <p>{report.suggestion}</p>
          </div>

          <div className="bg-green-100 p-3 rounded-md">
            <h3 className="font-semibold mb-1">Prescriptions / Recommendations:</h3>
            <p>{report.prescription}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportAnalyzer;
