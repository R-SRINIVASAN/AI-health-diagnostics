import React, { useState, useCallback } from 'react';
import { FileText, Upload, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MedicalReport } from '../types';
import { useDropzone } from 'react-dropzone';
import { PDFExportUtil } from '../utils/pdfExport';

const ReportAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock OCR and AI analysis function
  const analyzeReport = async (file: File): Promise<MedicalReport> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock extracted data based on file name patterns
    const fileName = file.name.toLowerCase();
    let extractedData: Record<string, any> = {};
    let analysis = '';
    let reportType = 'General Medical Report';

    if (fileName.includes('blood') || fileName.includes('cbc')) {
      reportType = 'Complete Blood Count (CBC)';
      extractedData = {
        'Hemoglobin': { value: 12.5, unit: 'g/dL', normalRange: '12.0-16.0', status: 'Normal' },
        'WBC Count': { value: 7200, unit: '/μL', normalRange: '4000-11000', status: 'Normal' },
        'RBC Count': { value: 4.2, unit: 'million/μL', normalRange: '4.2-5.4', status: 'Normal' },
        'Platelet Count': { value: 250000, unit: '/μL', normalRange: '150000-450000', status: 'Normal' },
        'Hematocrit': { value: 38, unit: '%', normalRange: '36-46', status: 'Normal' }
      };
      analysis = 'Your complete blood count shows normal values across all parameters. Hemoglobin levels are within the healthy range, indicating good oxygen-carrying capacity. White blood cell count is normal, suggesting no signs of infection or immune system issues. Platelet count is adequate for proper blood clotting function.';
    } else if (fileName.includes('lipid') || fileName.includes('cholesterol')) {
      reportType = 'Lipid Profile';
      extractedData = {
        'Total Cholesterol': { value: 195, unit: 'mg/dL', normalRange: '<200', status: 'Normal' },
        'LDL Cholesterol': { value: 120, unit: 'mg/dL', normalRange: '<100', status: 'Borderline High' },
        'HDL Cholesterol': { value: 45, unit: 'mg/dL', normalRange: '>40', status: 'Normal' },
        'Triglycerides': { value: 150, unit: 'mg/dL', normalRange: '<150', status: 'Normal' }
      };
      analysis = 'Your lipid profile shows mostly normal values with one area of concern. LDL cholesterol is slightly elevated at 120 mg/dL, which puts you in the borderline high category. Consider dietary modifications to reduce saturated fat intake and increase physical activity. HDL cholesterol and triglycerides are within normal ranges.';
    } else if (fileName.includes('kidney') || fileName.includes('creatinine')) {
      reportType = 'Kidney Function Test';
      extractedData = {
        'Creatinine': { value: 1.0, unit: 'mg/dL', normalRange: '0.6-1.2', status: 'Normal' },
        'BUN': { value: 15, unit: 'mg/dL', normalRange: '7-20', status: 'Normal' },
        'eGFR': { value: 90, unit: 'mL/min/1.73m²', normalRange: '>60', status: 'Normal' },
        'Protein in Urine': { value: 'Trace', unit: '', normalRange: 'Negative', status: 'Trace' }
      };
      analysis = 'Your kidney function tests indicate good overall kidney health. Creatinine and BUN levels are within normal ranges, and your estimated glomerular filtration rate (eGFR) shows excellent kidney function. There is a trace amount of protein in urine, which should be monitored but is not immediately concerning.';
    } else {
      extractedData = {
        'Overall Assessment': { value: 'Normal', unit: '', normalRange: '', status: 'Normal' },
        'Key Findings': { value: 'No significant abnormalities detected', unit: '', normalRange: '', status: 'Normal' }
      };
      analysis = 'The medical report has been analyzed and shows no significant abnormalities. All major parameters appear to be within expected ranges. Please consult with your healthcare provider for detailed interpretation and any specific recommendations.';
    }

    return {
      id: Date.now().toString(),
      userId: user?.id || '1',
      fileName: file.name,
      reportType,
      extractedData,
      analysis,
      uploadDate: new Date()
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsAnalyzing(true);
    
    try {
      const analyzedReport = await analyzeReport(file);
      setReports(prev => [analyzedReport, ...prev]);
      setSelectedReport(analyzedReport);
    } catch (error) {
      console.error('Report analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleDownloadPDF = async () => {
    if (!selectedReport) return;
    
    try {
      const reportData = {
        'Patient Name': user?.name,
        'Report Type': selectedReport.reportType,
        'Upload Date': selectedReport.uploadDate.toLocaleString(),
        'File Name': selectedReport.fileName,
        'Analysis': selectedReport.analysis,
        ...Object.entries(selectedReport.extractedData).reduce((acc, [key, value]) => {
          if (typeof value === 'object' && value !== null) {
            acc[key] = `${value.value} ${value.unit} (Normal: ${value.normalRange}) - ${value.status}`;
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>)
      };
      
      await PDFExportUtil.generateReportPDF(reportData, 'Medical Report Analysis');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'high': case 'elevated': case 'borderline high': return 'text-red-600 bg-red-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'trace': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'high': case 'elevated': case 'borderline high': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Report Analyzer</h1>
          <p className="text-gray-600">Upload and analyze your medical reports with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Report</h2>
            
            {/* File Upload */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop a medical report here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, PNG, JPG (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">Analyzing report...</span>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Processing OCR and running AI analysis
                </p>
              </div>
            )}

            {/* Recent Reports */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Reports</h3>
              {reports.length === 0 ? (
                <p className="text-gray-500 text-sm">No reports uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {reports.slice(0, 5).map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-900">
                        {report.reportType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedReport.reportType}</h2>
                  <p className="text-sm text-gray-500">
                    Uploaded: {selectedReport.uploadDate.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* Extracted Values */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Extracted Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedReport.extractedData).map(([key, value]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{key}</span>
                        {typeof value === 'object' && value !== null && value.status && (
                          <span className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(value.status)}`}>
                            {getStatusIcon(value.status)}
                            <span>{value.status}</span>
                          </span>
                        )}
                      </div>
                      
                      {typeof value === 'object' && value !== null ? (
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {value.value} {value.unit}
                          </p>
                          {value.normalRange && (
                            <p className="text-sm text-gray-500">
                              Normal: {value.normalRange}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700">{String(value)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">AI Analysis & Recommendations</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Eye className="h-6 w-6 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Clinical Interpretation</h4>
                      <p className="text-blue-800 leading-relaxed">{selectedReport.analysis}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Medical Disclaimer</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This AI analysis is for informational purposes only. Please consult with your healthcare provider for professional medical interpretation and treatment recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No Report Selected</h2>
              <p className="text-gray-500">
                Upload a medical report or select from your recent reports to view the analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportAnalyzer;