// src/components/ReportAnalyzer.tsx

import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { UploadCloud, FileText, XCircle, Loader, FlaskConical, Stethoscope, Lightbulb, ClipboardCheck, AlertCircle, Download, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Make sure this import is correct
import { PDFExportUtil } from '../utils/pdfExport';

// --- Define Types (Enhanced) ---
export interface ExtractedParameter {
    value: number | string;
    unit: string;
    normalRange: string;
    status: 'Normal' | 'High' | 'Low' | 'Borderline High' | 'Slightly High' | 'Elevated' | 'Critical High' | 'Critical Low' | 'Positive' | 'Negative' | 'Indeterminate';
    numericValue?: number;
    min?: number;
    max?: number;
    type?: 'numeric' | 'qualitative' | 'greater_than' | 'less_than';
}

export interface MedicalReport {
    id: string;
    userId: string;
    fileName: string;
    reportType: string;
    extractedData: Record<string, ExtractedParameter>;
    analysis: string;
    suggestion: string;
    prescription: string;
    uploadDate: Date;
    processingError?: string;
}

interface WHONormalRangeDefinition {
    min?: number;
    max?: number;
    unit?: string;
    type: 'numeric' | 'qualitative' | 'greater_than' | 'less_than';
    description: string;
}

interface WHONormalRanges {
    [key: string]: WHONormalRangeDefinition;
}

const WHO_NORMAL_RANGES: WHONormalRanges = {
    'Hemoglobin': { min: 12.0, max: 16.0, unit: 'g/dL', type: 'numeric', description: 'Measures the oxygen-carrying capacity of blood.' },
    'WBC Count': { min: 4.0, max: 11.0, unit: 'x10^9/L', type: 'numeric', description: 'Indicates immune system activity and potential infection.' },
    'Platelet Count': { min: 150, max: 450, unit: 'x10^9/L', type: 'numeric', description: 'Essential for blood clotting.' },
    'Total Cholesterol': { max: 200, unit: 'mg/dL', type: 'less_than', description: 'Overall cholesterol level.' },
    'LDL Cholesterol': { max: 100, unit: 'mg/dL', type: 'less_than', description: '"Bad" cholesterol, contributes to artery plaque.' },
    'HDL Cholesterol': { min: 40, unit: 'mg/dL', type: 'greater_than', description: '"Good" cholesterol, helps remove bad cholesterol.' },
    'Triglycerides': { max: 150, unit: 'mg/dL', type: 'less_than', description: 'Type of fat in the blood.' },
    'Creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', type: 'numeric', description: 'Waste product filtered by kidneys.' },
    'eGFR': { min: 60, unit: 'mL/min/1.73m²', type: 'greater_than', description: 'Estimated Glomerular Filtration Rate (kidney filtering capacity).' },
    'ALT (SGPT)': { min: 7, max: 56, unit: 'U/L', type: 'numeric', description: 'Liver enzyme, elevated in liver damage.' },
    'TSH': { min: 0.4, max: 4.0, unit: 'μIU/mL', type: 'numeric', description: 'Thyroid Stimulating Hormone, indicates thyroid activity.' },
    'Free T4': { min: 0.8, max: 1.8, unit: 'ng/dL', type: 'numeric', description: 'Active form of thyroid hormone.' },
    'HbA1c': { max: 5.6, unit: '%', type: 'less_than', description: 'Average blood sugar over 2-3 months.' },
    'Fasting Glucose': { min: 70, max: 100, unit: 'mg/dL', type: 'numeric', description: 'Blood sugar after fasting.' },
    'RBC in Urine': { max: 2, unit: '/HPF', type: 'less_than', description: 'Red blood cells in urine, indicates bleeding in urinary tract.' },
    'Pus Cells in Urine': { max: 5, unit: '/HPF', type: 'less_than', description: 'White blood cells in urine, indicates infection.' },
    'Bacteria in Urine': { type: 'qualitative', description: 'Presence of bacteria in urine.' },
    'Protein in Urine': { type: 'qualitative', description: 'Indicates kidney damage if present in significant amounts.' },
    'COVID-19 Test': { type: 'qualitative', description: 'Detects presence of SARS-CoV-2 virus.' },
};

// Helper function to determine status based on value and dynamic range definition
const getStatus = (paramName: string, value: number | string): ExtractedParameter['status'] => {
    const rangeDef = WHO_NORMAL_RANGES[paramName];

    // If no range definition, default to Normal, or use qualitative check for strings
    if (!rangeDef) {
        if (typeof value === 'string') {
            const lowerCaseValue = value.toLowerCase();
            if (lowerCaseValue.includes('negative') || lowerCaseValue.includes('absent') || lowerCaseValue.includes('normal')) return 'Normal';
            if (lowerCaseValue.includes('positive') || lowerCaseValue.includes('present') || lowerCaseValue.includes('detected')) return 'Positive';
            if (lowerCaseValue.includes('indeterminate') || lowerCaseValue.includes('trace')) return 'Indeterminate';
        }
        return 'Normal'; // Default for unknown numeric or unlisted qualitative
    }

    // Handle qualitative parameters
    if (rangeDef.type === 'qualitative') {
        if (typeof value === 'string') {
            const lowerCaseValue = value.toLowerCase();
            if (lowerCaseValue.includes('negative') || lowerCaseValue.includes('absent') || lowerCaseValue.includes('normal')) {
                return 'Normal';
            }
            if (lowerCaseValue.includes('positive') || lowerCaseValue.includes('present') || lowerCaseValue.includes('detected')) {
                return 'Positive';
            }
            if (lowerCaseValue.includes('indeterminate') || lowerCaseValue.includes('trace')) {
                return 'Indeterminate';
            }
        }
        return 'Indeterminate'; // If qualitative value is not recognized
    }

    // Handle numeric parameters
    if (typeof value !== 'number') {
        // If it's supposed to be numeric but isn't, consider it indeterminate
        console.warn(`Value for ${paramName} is not a number, but expected numeric: ${value}`);
        return 'Indeterminate';
    }

    const val = value;
    const min = rangeDef.min;
    const max = rangeDef.max;

    if (rangeDef.type === 'numeric') {
        if (min !== undefined && max !== undefined) {
            const range = max - min;
            const criticalHighThreshold = max + range * 0.5;
            const elevatedThreshold = max + range * 0.25;
            const slightlyHighThreshold = max + range * 0.1;

            const criticalLowThreshold = min - range * 0.5;
            const lowThreshold = min - range * 0.1;
            const slightlyLowThreshold = min - range * 0.02;

            if (val < min) {
                if (val <= criticalLowThreshold) return 'Critical Low';
                if (val <= lowThreshold) return 'Low';
                if (val <= slightlyLowThreshold) return 'Slightly Low';
                return 'Low';
            }
            if (val > max) {
                if (val >= criticalHighThreshold) return 'Critical High';
                if (val >= elevatedThreshold) return 'Elevated';
                if (val >= slightlyHighThreshold) return 'Slightly High';
                return 'High';
            }
            return 'Normal';
        }
    } else if (rangeDef.type === 'greater_than') {
        if (min !== undefined) {
            if (val < min) return 'Low';
            return 'Normal';
        }
    } else if (rangeDef.type === 'less_than') {
        if (max !== undefined) {
            if (val > max) return 'High';
            return 'Normal';
        }
    }

    return 'Normal'; // Fallback if range type or min/max are not fully defined for numeric
};


const getDynamicPrediction = (extractedData: Record<string, ExtractedParameter>): { analysis: string; suggestion: string; prescription: string } => {
    let analysis = "Analysis not available.";
    let suggestion = "Consult a healthcare professional for interpretation.";
    let prescription = "No specific prescription can be provided.";

    const abnormalParams = Object.entries(extractedData).filter(([, param]) =>
        param.status !== 'Normal' && param.status !== 'Indeterminate'
    );

    if (abnormalParams.length > 0) {
        analysis = `Detected ${abnormalParams.length} parameters outside normal ranges. Examples: `;
        abnormalParams.slice(0, 3).forEach(([key, param]) => {
            analysis += `${key} (${param.status}: ${param.value}${param.unit || ''}), `;
        });
        analysis = analysis.slice(0, -2) + '. This indicates potential health deviations.';
        suggestion = 'A comprehensive review by a qualified medical professional is highly recommended. Consider discussing these specific abnormal findings with your doctor.';
        prescription = 'No self-medication. Any prescription must come from a licensed doctor after a thorough examination.';

        const hba1c = extractedData['HbA1c']?.numericValue;
        const ldl = extractedData['LDL Cholesterol']?.numericValue;
        const tsh = extractedData['TSH']?.numericValue;
        const wbcCount = extractedData['WBC Count']?.numericValue;

        if (hba1c && hba1c >= 6.5) {
            analysis = `High HbA1c (${hba1c}%) strongly suggests Diabetes Mellitus type 2 (WHO criteria).`;
            suggestion = 'Immediate consultation with an endocrinologist or diabetologist is crucial. Implement rigorous dietary changes (low sugar, low carb), consistent exercise, and weight management. Regular self-monitoring of blood glucose is advised.';
            prescription = 'Medication, such as Metformin, or other glucose-lowering agents may be initiated by your doctor. Insulin therapy might be required depending on severity. Lifelong management and regular follow-ups are essential.';
        } else if (hba1c && hba1c >= 5.7 && hba1c < 6.5) {
            analysis = `Elevated HbA1c (${hba1c}%) indicates prediabetes (WHO criteria). This is a warning sign.`;
            suggestion = 'Intensive lifestyle modifications are necessary to prevent progression to full-blown diabetes. Focus on a balanced diet, regular physical activity, and weight loss (if overweight/obese).';
            prescription = 'No medication typically prescribed for prediabetes initially. Monitor HbA1c every 6-12 months. Discuss with your doctor if Metformin is appropriate for high-risk individuals.';
        }

        if (ldl && ldl > 100 && extractedData['HDL Cholesterol']?.numericValue && extractedData['HDL Cholesterol'].numericValue < (WHO_NORMAL_RANGES['HDL Cholesterol']?.min || 0)) {
            analysis += ` Elevated LDL Cholesterol (${ldl} mg/dL) and low HDL Cholesterol (${extractedData['HDL Cholesterol'].value} mg/dL) significantly increases cardiovascular risk.`;
            suggestion += ' Focus on a low-saturated fat, low-trans fat, and low-cholesterol diet. Increase soluble fiber intake (oats, beans). Regular aerobic exercise is vital. Quit smoking if applicable.';
            prescription += ' Lipid-lowering medication (e.g., statins) may be prescribed by a cardiologist or primary care physician, especially if other risk factors are present.';
        }

        if (tsh && tsh > 4.0 && extractedData['Free T4']?.numericValue && extractedData['Free T4'].numericValue < (WHO_NORMAL_RANGES['Free T4']?.min || 0)) {
             analysis += ` Elevated TSH (${tsh} μIU/mL) with low Free T4 suggests primary hypothyroidism.`;
             suggestion += ' Monitor for symptoms like fatigue, weight gain, constipation, and cold intolerance.';
             prescription += ' Thyroid hormone replacement therapy (e.g., Levothyroxine) will likely be prescribed by an endocrinologist. Dosage adjustment based on TSH levels is crucial.';
        }

        if (wbcCount && wbcCount > (WHO_NORMAL_RANGES['WBC Count']?.max || 0)) {
            analysis += ` High WBC Count (${wbcCount}) indicates a likely infection or inflammatory process.`;
            suggestion += ' Seek medical attention for diagnosis and treatment. Rest and stay hydrated.';
            prescription += ' Antibiotics or anti-inflammatory drugs may be prescribed after further evaluation.';
        }
    } else {
        analysis = 'All tested parameters are within normal reference ranges. This is a good health indicator.';
        suggestion = 'Continue to maintain a healthy lifestyle, including a balanced diet and regular exercise. Regular health check-ups are recommended.';
        prescription = 'No specific medication is needed based on these results. Continue with routine health monitoring.';
    }

    return { analysis, suggestion, prescription };
};


const ReportAnalyzer: React.FC = () => {
    // Declare state and ref variables at the top
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // DANGER: This line was often placed too late. Move it up!
    const { user } = useAuth(); // <--- Correct position: Declare user here

    // Helper function to process data and add status (now only for uploaded files)
    const processFile = useCallback(async (file: File): Promise<MedicalReport> => {
        const fileName = file.name.toLowerCase();
        let extractedDataTemp: Record<string, Omit<ExtractedParameter, 'status' | 'min' | 'max' | 'type' | 'normalRange'>> = {};
        let reportType = 'General Medical Report';

        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500)); // Simulate async processing

        // --- Mock Data Generation based on filename patterns ---
        // This simulates extraction and populates extractedDataTemp
        if (fileName.includes('cbc')) {
            reportType = 'Complete Blood Count (CBC)';
            if (fileName.includes('abnormal')) {
                extractedDataTemp = {
                    'Hemoglobin': { value: 10.5, unit: 'g/dL', normalRange: '12.0-16.0', numericValue: 10.5 },
                    'WBC Count': { value: 13.0, unit: 'x10^9/L', normalRange: '4.0-11.0', numericValue: 13.0 },
                    'Platelet Count': { value: 120, unit: 'x10^9/L', normalRange: '150-450', numericValue: 120 },
                };
            } else {
                extractedDataTemp = {
                    'Hemoglobin': { value: 14.0, unit: 'g/dL', normalRange: '12.0-16.0', numericValue: 14.0 },
                    'WBC Count': { value: 8.0, unit: 'x10^9/L', normalRange: '4.0-11.0', numericValue: 8.0 },
                    'Platelet Count': { value: 280, unit: 'x10^9/L', normalRange: '150-450', numericValue: 280 },
                };
            }
        } else if (fileName.includes('lipid')) {
            reportType = 'Lipid Profile';
            if (fileName.includes('abnormal')) {
                extractedDataTemp = {
                    'Total Cholesterol': { value: 230, unit: 'mg/dL', normalRange: '<200', numericValue: 230 },
                    'LDL Cholesterol': { value: 160, unit: 'mg/dL', normalRange: '<100', numericValue: 160 },
                    'HDL Cholesterol': { value: 38, unit: 'mg/dL', normalRange: '>40', numericValue: 38 },
                    'Triglycerides': { value: 200, unit: 'mg/dL', normalRange: '<150', numericValue: 200 },
                };
            } else {
                extractedDataTemp = {
                    'Total Cholesterol': { value: 180, unit: 'mg/dL', normalRange: '<200', numericValue: 180 },
                    'LDL Cholesterol': { value: 85, unit: 'mg/dL', normalRange: '<100', numericValue: 85 },
                    'HDL Cholesterol': { value: 60, unit: 'mg/dL', normalRange: '>40', numericValue: 60 },
                };
            }
        } else if (fileName.includes('diabetes')) {
            reportType = 'Diabetes Panel';
            if (fileName.includes('abnormal')) {
                extractedDataTemp = {
                    'Fasting Glucose': { value: 135, unit: 'mg/dL', normalRange: '70-100', numericValue: 135 },
                    'HbA1c': { value: 7.5, unit: '%', normalRange: '<5.7', numericValue: 7.5 },
                };
            } else {
                extractedDataTemp = {
                    'Fasting Glucose': { value: 95, unit: 'mg/dL', normalRange: '70-100', numericValue: 95 },
                    'HbA1c': { value: 5.4, unit: '%', normalRange: '<5.7', numericValue: 5.4 },
                };
            }
        } else if (fileName.includes('covid')) {
            reportType = 'COVID-19 Test Report';
            extractedDataTemp = {
                'COVID-19 Test': { value: 'Positive', unit: '', normalRange: 'Negative' },
            };
        }
        else {
            reportType = 'General Health Check';
            extractedDataTemp = {
                'Hemoglobin': { value: 13.0, unit: 'g/dL', normalRange: '12.0-16.0', numericValue: 13.0 },
                'Creatinine': { value: 0.9, unit: 'mg/dL', normalRange: '0.6-1.2', numericValue: 0.9 },
            };
        }

        // Now, iterate through extractedDataTemp to apply WHO_NORMAL_RANGES and getStatus
        const extractedData: MedicalReport['extractedData'] = {};
        for (const key in extractedDataTemp) {
            if (extractedDataTemp.hasOwnProperty(key)) {
                const rawParam = extractedDataTemp[key];
                const rangeDef = WHO_NORMAL_RANGES[key];
                const processedParam: ExtractedParameter = {
                    ...rawParam,
                    status: getStatus(key, rawParam.value),
                    min: rangeDef?.min,
                    max: rangeDef?.max,
                    unit: rawParam.unit || rangeDef?.unit,
                    type: rangeDef?.type,
                    normalRange: rangeDef?.type === 'numeric' && rangeDef?.min !== undefined && rangeDef?.max !== undefined ? `${rangeDef.min}-${rangeDef.max}` :
                                 rangeDef?.type === 'greater_than' && rangeDef?.min !== undefined ? `>${rangeDef.min}` :
                                 rangeDef?.type === 'less_than' && rangeDef?.max !== undefined ? `<${rangeDef.max}` :
                                 rawParam.normalRange || ''
                };
                if (typeof rawParam.value === 'number') {
                    processedParam.numericValue = rawParam.value;
                }
                extractedData[key] = processedParam;
            }
        }

        const { analysis, suggestion, prescription } = getDynamicPrediction(extractedData);

        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: user?.id || 'anonymous', // 'user' is now defined
            fileName: file.name,
            reportType,
            extractedData,
            analysis,
            suggestion,
            prescription,
            uploadDate: new Date(),
        };
    }, [user]); // 'user' is correctly a dependency here now

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setGlobalError(null);
        if (event.target.files && event.target.files.length > 0) {
            setLoading(true);
            const filesToProcess = Array.from(event.target.files);
            const newReports: MedicalReport[] = [];
            const errors: string[] = [];

            for (const file of filesToProcess) {
                try {
                    const report = await processFile(file);
                    newReports.push(report);
                } catch (err) {
                    console.error('Error processing file:', file.name, err);
                    errors.push(`Failed to process ${file.name}.`);
                    newReports.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        userId: user?.id || 'anonymous', // 'user' is now defined
                        fileName: file.name,
                        reportType: 'Processing Failed',
                        extractedData: {}, // Empty extracted data for failed reports
                        analysis: 'File could not be processed due to an error.',
                        suggestion: 'Please try again or upload a different file.',
                        prescription: '',
                        uploadDate: new Date(),
                        processingError: `Error: ${err instanceof Error ? err.message : String(err)}`
                    });
                }
            }

            setReports((prevReports) => [...prevReports, ...newReports]);
            setLoading(false);
            if (errors.length > 0) {
                setGlobalError(`Some files could not be processed: ${errors.join(' ')}`);
            }
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeReport = (id: string) => {
        setReports(reports.filter((report) => report.id !== id));
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setGlobalError(null);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const filesToProcess = Array.from(event.dataTransfer.files);
            handleFileChange({ target: { files: filesToProcess } } as ChangeEvent<HTMLInputElement>);
        }
    }, [handleFileChange]);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }, []);

    const exportToPdf = (report: MedicalReport) => {
        PDFExportUtil.exportReportToPdf(report, WHO_NORMAL_RANGES, user?.name || 'User'); // 'user' is now defined
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 font-sans">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10 drop-shadow-sm">
                <FlaskConical className="inline-block w-10 h-10 mr-3 text-blue-600" />
                Dynamic Health Report Analyzer
            </h1>

            <div
                className="border-2 border-dashed border-blue-400 rounded-lg p-10 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 relative"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpeg,.jpg"
                />
                {loading ? (
                    <div className="flex items-center justify-center text-blue-600">
                        <Loader className="animate-spin w-8 h-8 mr-3" />
                        <span className="text-lg font-semibold">Processing reports... Please wait.</span>
                    </div>
                ) : (
                    <div className="text-gray-600">
                        <UploadCloud className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                        <p className="text-xl font-semibold mb-2">Drag & Drop Your Medical Reports Here</p>
                        <p className="text-sm">or Click to Upload (PDF, DOCX, TXT, Images)</p>
                        <p className="text-xs text-gray-500 mt-2">Supports multiple files.</p>
                    </div>
                )}
            </div>

            {globalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mt-6 flex items-center shadow-md">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <span className="block sm:inline font-medium">{globalError}</span>
                </div>
            )}

            {reports.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        <ClipboardCheck className="inline-block w-8 h-8 mr-2 text-green-600" />
                        Analyzed Reports
                    </h2>
                    <div className="flex flex-nowrap overflow-x-auto gap-8 pb-4 px-8 -mx-8 custom-scrollbar justify-start items-stretch">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 relative flex-shrink-0"
                                style={{ minWidth: '350px', maxWidth: '400px', width: '380px', height: 'auto' }}
                            >
                                <button
                                    onClick={() => removeReport(report.id)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors"
                                    aria-label="Remove report"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                                {report.processingError ? (
                                    <div className="text-red-600 font-semibold mb-4 flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-2" /> Failed to Load: {report.fileName}
                                        <p className="text-sm text-gray-500 italic mt-1">{report.processingError}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center mb-4">
                                            <FileText className="w-7 h-7 mr-3 text-blue-500" />
                                            <h3 className="text-xl font-semibold text-gray-800 truncate" title={report.fileName}>{report.fileName}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            <span className="font-medium text-gray-700">Type:</span> {report.reportType}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            <span className="font-medium text-gray-700">Uploaded:</span> {report.uploadDate.toLocaleDateString()}
                                        </p>

                                        <div className="mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            <h4 className="font-bold text-md text-gray-700 mb-2 flex items-center"><FlaskConical className="w-4 h-4 mr-2 text-purple-600"/> Extracted Data:</h4>
                                            {Object.keys(report.extractedData).length > 0 ? (
                                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                                    {Object.entries(report.extractedData).map(([key, data]) => {
                                                        const statusColor =
                                                            data.status === 'Normal' ? 'text-green-600' :
                                                            (data.status && (data.status.includes('High') || data.status.includes('Low') || data.status === 'Positive' || data.status.includes('Critical'))) ? 'text-red-500' :
                                                            (data.status && (data.status.includes('Elevated') || data.status.includes('Borderline') || data.status.includes('Slightly'))) ? 'text-amber-500' :
                                                            'text-gray-600';

                                                        const dotColor =
                                                            data.status === 'Normal' ? '#22C55E' :
                                                            (data.status && (data.status.includes('High') || data.status.includes('Low') || data.status === 'Positive' || data.status.includes('Critical'))) ? '#EF4444' :
                                                            (data.status && (data.status.includes('Elevated') || data.status.includes('Borderline') || data.status.includes('Slightly'))) ? '#FBBF24' :
                                                            '#6B7280';

                                                        const normalRangeText =
                                                            data.type === 'numeric' && data.min !== undefined && data.max !== undefined ? `${data.min}-${data.max}` :
                                                            data.type === 'greater_than' && data.min !== undefined ? `>${data.min}` :
                                                            data.type === 'less_than' && data.max !== undefined ? `<${data.max}` :
                                                            data.normalRange;

                                                        return (
                                                            <li key={key} className="flex items-start">
                                                                <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 mr-2"
                                                                    style={{ backgroundColor: dotColor }}
                                                                ></span>
                                                                <div className="flex-grow">
                                                                    <span className="font-medium">{key}:</span> {data.value} {data.unit} (Normal: {normalRangeText}) - <span className={`font-semibold ${statusColor}`}>
                                                                        {data.status || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 italic">No specific data extracted or applicable.</p>
                                            )}
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div>
                                                <h4 className="font-bold text-md text-gray-700 mb-1 flex items-center"><Lightbulb className="w-4 h-4 mr-2 text-yellow-600"/> Analysis:</h4>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100">{report.analysis}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-md text-gray-700 mb-1 flex items-center"><Stethoscope className="w-4 h-4 mr-2 text-cyan-600"/> Suggestion:</h4>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100">{report.suggestion}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-md text-gray-700 mb-1 flex items-center"><ClipboardCheck className="w-4 h-4 mr-2 text-green-600"/> Prescription:</h4>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100">{report.prescription}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => exportToPdf(report)}
                                            className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-md"
                                        >
                                            <Download className="w-5 h-5 mr-2" /> Export to PDF
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
};

export default ReportAnalyzer;