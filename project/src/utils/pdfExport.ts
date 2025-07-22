import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // Kept for the original generatePDF method

// Define types for better type safety and clarity
interface HealthVital {
    id: string;
    userId: string;
    date: Date;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    oxygenSaturation: number;
    bloodSugar: number;
    temperature: number;
    weight: number;
    notes?: string;
}

interface UserProfile {
    id: string;
    name?: string;
    dob?: string; // Date of Birth, e.g., 'YYYY-MM-DD'
    gender?: 'Male' | 'Female' | 'Other';
    heightCm?: number;
    // Added for report:
    address?: string;
    consultingDoctor?: string;
}

interface PredictionMessage {
    message: string;
    type: 'alert' | 'info' | 'good';
}

// Define detailed categories with specific RGB colors and risk scores for PDF rendering
const VITAL_CATEGORIES = {
    BP_CRITICAL: { status: 'Critical', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' }, // RGB for dark red
    BP_DANGER: { status: 'High Risk', color: [220, 20, 60], text: 'white', risk: 4, icon: '⚠️' }, // RGB for crimson
    BP_HIGH: { status: 'High', color: [255, 140, 0], text: 'white', risk: 3, icon: '▲' }, // RGB for dark orange
    BP_ELEVATED: { status: 'Elevated', color: [255, 215, 0], text: 'black', risk: 2, icon: '△' }, // RGB for gold
    BP_NORMAL: { status: 'Normal', color: [34, 139, 34], text: 'white', risk: 1, icon: '✔' }, // RGB for forest green

    HR_CRITICAL_HIGH: { status: 'Critical High', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' },
    HR_HIGH: { status: 'High', color: [255, 140, 0], text: 'white', risk: 3, icon: '▲' },
    HR_NORMAL: { status: 'Normal', color: [34, 139, 34], text: 'white', risk: 1, icon: '✔' },
    HR_LOW: { status: 'Low', color: [0, 191, 255], text: 'white', risk: 3, icon: '▼' }, // Deep Sky Blue
    HR_CRITICAL_LOW: { status: 'Critical Low', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' },

    SPO2_CRITICAL: { status: 'Critical Low', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' },
    SPO2_DANGER: { status: 'Moderate Low', color: [220, 20, 60], text: 'white', risk: 4, icon: '⚠️' },
    SPO2_LOW: { status: 'Mild Low', color: [255, 140, 0], text: 'white', risk: 3, icon: '▼' },
    SPO2_NORMAL: { status: 'Normal', color: [34, 139, 34], text: 'white', risk: 1, icon: '✔' },

    BS_DIABETES: { status: 'Diabetic Range', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' },
    BS_PREDIABETES: { status: 'Pre-diabetic', color: [255, 140, 0], text: 'white', risk: 3, icon: '▲' },
    BS_NORMAL: { status: 'Normal', color: [34, 139, 34], text: 'white', risk: 1, icon: '✔' },
    BS_LOW: { status: 'Hypoglycemia', color: [0, 191, 255], text: 'white', risk: 4, icon: '▼' },

    TEMP_CRITICAL_HIGH: { status: 'High Fever', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' },
    TEMP_FEVER: { status: 'Fever', color: [255, 140, 0], text: 'white', risk: 4, icon: '▲' },
    TEMP_NORMAL: { status: 'Normal', color: [34, 139, 34], text: 'white', risk: 1, icon: '✔' },
    TEMP_LOW: { status: 'Hypothermia', color: [0, 191, 255], text: 'white', risk: 5, icon: '▼' },
    TEMP_ABNORMAL: { status: 'Abnormal', color: [255, 215, 0], text: 'black', risk: 2, icon: '△' },

    BMI_OBESE_III: { status: 'Obese Class III', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' },
    BMI_OBESE_II: { status: 'Obese Class II', color: [220, 20, 60], text: 'white', risk: 4, icon: '⚠️' },
    BMI_OBESE_I: { status: 'Obese Class I', color: [255, 140, 0], text: 'white', risk: 3, icon: '▲' },
    BMI_OVERWEIGHT: { status: 'Overweight', color: [255, 215, 0], text: 'black', risk: 2, icon: '△' },
    BMI_NORMAL: { status: 'Normal Weight', color: [34, 139, 34], text: 'white', risk: 1, icon: '✔' },
    BMI_UNDERWEIGHT: { status: 'Underweight', color: [0, 191, 255], text: 'white', risk: 3, icon: '▼' },

    GENERIC_NORMAL: { status: 'Normal', color: [34, 139, 34], text: 'white', risk: 1, icon: '✔' },
    GENERIC_UNSTABLE: { status: 'Unstable', color: [255, 215, 0], text: 'black', risk: 2, icon: '△' },
    GENERIC_CONCERN: { status: 'Concerning', color: [255, 140, 0], text: 'white', risk: 3, icon: '▲' },
    GENERIC_CRITICAL: { status: 'Critical', color: [178, 34, 34], text: 'white', risk: 5, icon: '⚡' },
    GENERIC_INFO: { status: 'Info', color: [0, 191, 255], text: 'white', risk: 0, icon: 'ℹ️' },
    GENERIC_GOOD: { status: 'Good', color: [34, 139, 34], text: 'white', risk: 0, icon: '👍' },
};

type VitalCategory = typeof VITAL_CATEGORIES[keyof typeof VITAL_CATEGORIES];

// Helper functions to get vital categories (copied from HealthVitals.tsx for self-containment)
const getBpCategory = (systolic: number, diastolic: number): VitalCategory => {
    if (systolic > 180 || diastolic > 120) return VITAL_CATEGORIES.BP_CRITICAL;
    if (systolic >= 140 || diastolic >= 90) return VITAL_CATEGORIES.BP_DANGER;
    if (systolic >= 130 || diastolic >= 80) return VITAL_CATEGORIES.BP_HIGH;
    if (systolic >= 120 && diastolic < 80) return VITAL_CATEGORIES.BP_ELEVATED;
    if (systolic < 120 && diastolic < 80) return VITAL_CATEGORIES.BP_NORMAL;
    return VITAL_CATEGORIES.GENERIC_INFO;
};

const getHeartRateCategory = (heartRate: number): VitalCategory => {
    if (heartRate < 50) return VITAL_CATEGORIES.HR_CRITICAL_LOW;
    if (heartRate < 60) return VITAL_CATEGORIES.HR_LOW;
    if (heartRate > 120) return VITAL_CATEGORIES.HR_CRITICAL_HIGH;
    if (heartRate > 100) return VITAL_CATEGORIES.HR_HIGH;
    return VITAL_CATEGORIES.HR_NORMAL;
};

const getOxygenSaturationCategory = (spO2: number): VitalCategory => {
    if (spO2 < 85) return VITAL_CATEGORIES.SPO2_CRITICAL;
    if (spO2 >= 85 && spO2 <= 89) return VITAL_CATEGORIES.SPO2_DANGER;
    if (spO2 >= 90 && spO2 <= 94) return VITAL_CATEGORIES.SPO2_LOW;
    if (spO2 >= 95 && spO2 <= 100) return VITAL_CATEGORIES.SPO2_NORMAL;
    return VITAL_CATEGORIES.GENERIC_INFO;
};

const getBloodSugarCategory = (bloodSugar: number): VitalCategory => {
    if (bloodSugar < 70) return VITAL_CATEGORIES.BS_LOW;
    if (bloodSugar >= 126) return VITAL_CATEGORIES.BS_DIABETES;
    if (bloodSugar >= 100 && bloodSugar <= 125) return VITAL_CATEGORIES.BS_PREDIABETES;
    if (bloodSugar >= 70 && bloodSugar <= 99) return VITAL_CATEGORIES.BS_NORMAL;
    return VITAL_CATEGORIES.GENERIC_INFO;
};

const getTemperatureCategory = (temperature: number): VitalCategory => {
    if (temperature >= 103.0) return VITAL_CATEGORIES.TEMP_CRITICAL_HIGH;
    if (temperature >= 100.4) return VITAL_CATEGORIES.TEMP_FEVER;
    if (temperature < 95.0) return VITAL_CATEGORIES.TEMP_LOW;
    if (temperature >= 97.0 && temperature <= 99.6) return VITAL_CATEGORIES.TEMP_NORMAL;
    return VITAL_CATEGORIES.TEMP_ABNORMAL;
};

const getWeightCategory = (weight: number, heightCm: number): VitalCategory => {
    if (!heightCm || heightCm === 0) return VITAL_CATEGORIES.GENERIC_INFO;
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);

    if (bmi < 18.5) return VITAL_CATEGORIES.BMI_UNDERWEIGHT;
    if (bmi >= 18.5 && bmi <= 24.9) return VITAL_CATEGORIES.BMI_NORMAL;
    if (bmi >= 25.0 && bmi <= 29.9) return VITAL_CATEGORIES.BMI_OVERWEIGHT;
    if (bmi >= 30.0 && bmi <= 34.9) return VITAL_CATEGORIES.BMI_OBESE_I;
    if (bmi >= 35.0 && bmi <= 39.9) return VITAL_CATEGORIES.BMI_OBESE_II;
    if (bmi >= 40.0) return VITAL_CATEGORIES.BMI_OBESE_III;
    return VITAL_CATEGORIES.GENERIC_INFO;
};

// Reference Ranges for the PDF table
const REFERENCE_RANGES: { [key: string]: string } = {
    'Blood Pressure (Systolic)': '90-119 mmHg',
    'Blood Pressure (Diastolic)': '60-79 mmHg',
    'Heart Rate': '60-100 bpm',
    'Oxygen Saturation': '95-100%',
    'Blood Sugar (Fasting)': '70-99 mg/dL',
    'Temperature': '97.0-99.6 °F',
    'Weight': 'BMI 18.5-24.9 (based on height)'
};

export class PDFExportUtil {
    // Original method using html2canvas (kept for compatibility)
    static async generatePDF(elementId: string, title: string, filename?: string): Promise<void> {
        try {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Element with ID '${elementId}' not found`);
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(20);
            pdf.setTextColor(59, 130, 246);
            pdf.text(title, pdfWidth / 2, 20, { align: 'center' });

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            const now = new Date().toLocaleString();
            pdf.text(`Generated on: ${now}`, pdfWidth / 2, 30, { align: 'center' });

            let yPosition = 40;

            if (imgHeight > pdfHeight - yPosition - 10) {
                const pageHeight = pdfHeight - yPosition - 10;
                const totalPages = Math.ceil(imgHeight / pageHeight);

                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) {
                        pdf.addPage();
                        yPosition = 10;
                    }

                    const sourceY = i * (canvas.height * pageHeight / imgHeight);
                    const sourceHeight = Math.min(
                        canvas.height * pageHeight / imgHeight,
                        canvas.height - sourceY
                    );

                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = sourceHeight;

                    const tempCtx = tempCanvas.getContext('2d');
                    if (tempCtx) {
                        tempCtx.drawImage(
                            canvas,
                            0, sourceY, canvas.width, sourceHeight,
                            0, 0, canvas.width, sourceHeight
                        );

                        const tempImgData = tempCanvas.toDataURL('image/png');
                        const tempImgHeight = (sourceHeight * imgWidth) / canvas.width;

                        pdf.addImage(tempImgData, 'PNG', 10, yPosition, imgWidth, tempImgHeight);
                    }
                }
            } else {
                pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
            }

            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(107, 114, 128);
                pdf.text(
                    `Page ${i} of ${pageCount} | MediScan AI Health Report`,
                    pdfWidth / 2,
                    pdfHeight - 10,
                    { align: 'center' }
                );
            }

            const pdfFilename = filename || `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            pdf.save(pdfFilename);

        } catch (error) {
            console.error('PDF generation failed:', error);
            throw new Error('Failed to generate PDF. Please try again.');
        }
    }

    /**
     * Generates a structured, international-level lab report PDF.
     * @param vitals Array of HealthVital objects.
     * @param user UserProfile object or null.
     * @param healthPredictions Array of PredictionMessage objects.
     * @param reportTitle Title for the report.
     */
    static async generateLabReport(
        vitals: HealthVital[],
        user: UserProfile | null,
        healthPredictions: PredictionMessage[],
        reportTitle: string = 'Comprehensive Health Vitals Report'
    ): Promise<void> {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 15; // Initial Y position

        // Function to add a new page with header/footer
        const addNewPage = (sectionTitle?: string) => {
            doc.addPage();
            y = 15; // Reset Y for new page

            // Header for subsequent pages
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(25, 118, 210); // Blue color
            doc.text(reportTitle, 15, y);
            if (sectionTitle) {
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Section: ${sectionTitle}`, 15, y + 6);
            }
            y += 10;
            doc.setDrawColor(200, 200, 200); // Light grey line
            doc.line(15, y, pageWidth - 15, y);
            y += 8;
        };

        // --- Report Header ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 139); // Dark Blue
        doc.text('MediScan AI Health Systems', pageWidth / 2, y, { align: 'center' });
        y += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 100, 0); // Dark Green
        doc.text('Comprehensive Health Vitals Report', pageWidth / 2, y, { align: 'center' });
        y += 12;

        doc.setLineWidth(1);
        doc.setDrawColor(0, 0, 0); // Black line
        doc.line(15, y, pageWidth - 15, y);
        y += 8;

        // --- Patient & Report Details Section ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50); // Dark grey

        const patientDetails = [
            { label: 'CRNO', value: user?.id || 'N/A' },
            { label: 'Name', value: user?.name || 'Patient Name' },
            { label: 'Age / Sex', value: user?.dob ? `${new Date().getFullYear() - new Date(user.dob).getFullYear()} / ${user.gender || 'N/A'}` : 'N/A' },
            { label: 'Patient Address', value: user?.address || 'Virtual Healthcare, Global' },
        ];

        const reportDetails = [
            { label: 'Sample No', value: 'MSAI-001' }, // Placeholder
            { label: 'Consulting Doctor', value: user?.consultingDoctor || 'Dr. MediScan AI' },
            { label: 'Collected On', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) },
            { label: 'Reported On', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
        ];

        const col1X = 15;
        const col2X = pageWidth / 2 + 5; // Start of second column
        const detailLineHeight = 6;

        for (let i = 0; i < Math.max(patientDetails.length, reportDetails.length); i++) {
            if (patientDetails[i]) {
                doc.text(`${patientDetails[i].label}:`, col1X, y);
                doc.setFont('helvetica', 'normal');
                doc.text(patientDetails[i].value, col1X + doc.getStringUnitWidth(`${patientDetails[i].label}:`) * doc.getFontSize() + 2, y);
                doc.setFont('helvetica', 'bold');
            }
            if (reportDetails[i]) {
                doc.text(`${reportDetails[i].label}:`, col2X, y);
                doc.setFont('helvetica', 'normal');
                doc.text(reportDetails[i].value, col2X + doc.getStringUnitWidth(`${reportDetails[i].label}:`) * doc.getFontSize() + 2, y);
                doc.setFont('helvetica', 'bold');
            }
            y += detailLineHeight;
        }
        y += 5; // Extra space after details

        doc.setDrawColor(0, 0, 0);
        doc.line(15, y, pageWidth - 15, y);
        y += 8;

        // --- Vitals Table Section ---
        const tableHeaders = ['Test Name', 'Result', 'Unit', 'Reference Interval', 'Status'];
        const colWidths = [45, 25, 20, 55, 30]; // Adjusted widths for better fit, added 'Status'
        const startX = 15;
        const rowHeight = 7;

        const drawSectionHeader = (text: string) => {
            if (y + 15 > pageHeight - 30) { addNewPage('Recent Health Measurements'); }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setFillColor(220, 230, 241); // Light blue background
            doc.setTextColor(0, 0, 0);
            doc.rect(startX, y, pageWidth - 30, rowHeight + 2, 'F'); // Section header background
            doc.text(text, startX + 2, y + rowHeight / 2 + 1);
            y += rowHeight + 5;
        };

        const drawTableHeaders = () => {
            if (y + rowHeight > pageHeight - 30) { addNewPage('Recent Health Measurements'); }
            let currentX = startX;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255); // White text
            doc.setFillColor(60, 60, 60); // Dark gray header background

            tableHeaders.forEach((header, index) => {
                doc.rect(currentX, y, colWidths[index], rowHeight, 'F');
                doc.text(header, currentX + colWidths[index] / 2, y + rowHeight / 2 + 1, { align: 'center' });
                currentX += colWidths[index];
            });
            y += rowHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0); // Reset text color for rows
        };

        // Process each vital entry
        vitals.slice(0, 15).forEach((vital, entryIndex) => { // Limit to 15 recent entries
            if (entryIndex > 0 && y + 30 > pageHeight - 30) { // New page for new entry if close to bottom
                addNewPage('Recent Health Measurements');
            }

            drawSectionHeader(`Entry Date: ${new Date(vital.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
            drawTableHeaders();

            const vitalDataRows = [
                {
                    name: 'Blood Pressure (Systolic)', result: String(vital.bloodPressureSystolic), units: 'mmHg',
                    range: REFERENCE_RANGES['Blood Pressure (Systolic)'], category: getBpCategory(vital.bloodPressureSystolic, vital.bloodPressureDiastolic)
                },
                {
                    name: 'Blood Pressure (Diastolic)', result: String(vital.bloodPressureDiastolic), units: 'mmHg',
                    range: REFERENCE_RANGES['Blood Pressure (Diastolic)'], category: getBpCategory(vital.bloodPressureSystolic, vital.bloodPressureDiastolic)
                },
                {
                    name: 'Heart Rate', result: String(vital.heartRate), units: 'bpm',
                    range: REFERENCE_RANGES['Heart Rate'], category: getHeartRateCategory(vital.heartRate)
                },
                {
                    name: 'Oxygen Saturation', result: String(vital.oxygenSaturation), units: '%',
                    range: REFERENCE_RANGES['Oxygen Saturation'], category: getOxygenSaturationCategory(vital.oxygenSaturation)
                },
                {
                    name: 'Blood Sugar', result: String(vital.bloodSugar), units: 'mg/dL',
                    range: REFERENCE_RANGES['Blood Sugar (Fasting)'], category: getBloodSugarCategory(vital.bloodSugar)
                },
                {
                    name: 'Temperature', result: vital.temperature.toFixed(1), units: '°F',
                    range: REFERENCE_RANGES['Temperature'], category: getTemperatureCategory(vital.temperature)
                },
                {
                    name: 'Weight', result: vital.weight.toFixed(1), units: 'kg',
                    range: REFERENCE_RANGES['Weight'], category: getWeightCategory(vital.weight, user?.heightCm || 0)
                }
            ];

            vitalDataRows.forEach(item => {
                if (y + rowHeight > pageHeight - 30) { addNewPage('Recent Health Measurements'); drawTableHeaders(); } // Ensure space for row and redraw headers

                let currentCellX = startX;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);

                // Test Name
                doc.text(item.name, currentCellX + 2, y + rowHeight / 2 + 1);
                currentCellX += colWidths[0];

                // Result (with color coding)
                doc.setTextColor.apply(doc, item.category.color);
                doc.text(item.result, currentCellX + colWidths[1] / 2, y + rowHeight / 2 + 1, { align: 'center' });
                currentCellX += colWidths[1];

                // Unit
                doc.setTextColor(0, 0, 0); // Reset to black
                doc.text(item.units, currentCellX + colWidths[2] / 2, y + rowHeight / 2 + 1, { align: 'center' });
                currentCellX += colWidths[2];

                // Reference Range
                doc.text(item.range, currentCellX + colWidths[3] / 2, y + rowHeight / 2 + 1, { align: 'center' });
                currentCellX += colWidths[3];

                // Status
                doc.setFillColor.apply(doc, item.category.color);
                doc.setTextColor.apply(doc, item.category.text === 'white' ? [255, 255, 255] : [0, 0, 0]);
                doc.rect(currentCellX, y, colWidths[4], rowHeight, 'F');
                doc.text(item.category.status, currentCellX + colWidths[4] / 2, y + rowHeight / 2 + 1, { align: 'center' });

                y += rowHeight;
            });

            // Add notes if available
            if (vital.notes) {
                if (y + 10 > pageHeight - 30) { addNewPage('Recent Health Measurements'); }
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                const notesLines = doc.splitTextToSize(`Notes: ${vital.notes}`, pageWidth - 30);
                notesLines.forEach(line => {
                    doc.text(line, startX + 2, y + 2);
                    y += 4;
                });
                y += 2; // Small gap after notes
            }
            y += 5; // Gap between entries
        });

        y += 10; // Extra space after table

        // --- AI Insights Section ---
        if (y + 20 > pageHeight - 30) {
            addNewPage('AI-Powered Health Insights');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(25, 118, 210);
        doc.text('AI-Powered Health Insights & Recommendations', 15, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        healthPredictions.forEach(prediction => {
            if (y + 15 > pageHeight - 30) { // Check for page break within predictions
                addNewPage('AI-Powered Health Insights');
            }

            let textColor: [number, number, number] = [0, 0, 0]; // Default black
            let bgColor: [number, number, number] = [240, 240, 240]; // Light gray background for all
            let prefixIcon = '';

            if (prediction.type === 'alert') {
                textColor = [178, 34, 34]; // Dark Red
                bgColor = [255, 240, 240]; // Light red background
                prefixIcon = VITAL_CATEGORIES.GENERIC_CRITICAL.icon;
            } else if (prediction.type === 'info') {
                textColor = [0, 100, 0]; // Dark Green
                bgColor = [240, 255, 240]; // Light green background
                prefixIcon = VITAL_CATEGORIES.GENERIC_INFO.icon;
            } else if (prediction.type === 'good') {
                textColor = [0, 0, 128]; // Navy Blue
                bgColor = [240, 240, 255]; // Light blue background
                prefixIcon = VITAL_CATEGORIES.GENERIC_GOOD.icon;
            }

            const messageWithIcon = `${prefixIcon} ${prediction.message}`;

            doc.setFillColor.apply(doc, bgColor);
            doc.rect(15, y, pageWidth - 30, 12, 'F'); // Background for prediction block

            doc.setTextColor.apply(doc, textColor);
            // Parse HTML-like bold tags for PDF bolding
            const parts = messageWithIcon.split(/(<strong>.*?<\/strong>)/g);
            let currentX = 18; // Start slightly indented
            const lineHeight = 6;
            parts.forEach(part => {
                if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
                    doc.setFont('helvetica', 'bold');
                    const text = part.replace('<strong>', '').replace('</strong>', '');
                    const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
                    if (currentX + textWidth > pageWidth - 18) { // New line if it overflows
                        y += lineHeight;
                        currentX = 18;
                    }
                    doc.text(text, currentX, y + 4); // Adjusted for vertical centering in block
                    currentX += textWidth;
                } else {
                    doc.setFont('helvetica', 'normal');
                    const textWidth = doc.getStringUnitWidth(part) * doc.getFontSize() / doc.internal.scaleFactor;
                    if (currentX + textWidth > pageWidth - 18) { // New line if it overflows
                        y += lineHeight;
                        currentX = 18;
                    }
                    doc.text(part, currentX, y + 4); // Adjusted for vertical centering in block
                    currentX += textWidth;
                }
            });
            y += lineHeight + 8; // Advance Y after each prediction block
            doc.setTextColor(0, 0, 0); // Reset to black for next prediction
        });

        y += 10;

        // --- Disclaimer ---
        if (y + 20 > pageHeight - 30) {
            addNewPage('Important Disclaimer');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Disclaimer:', 15, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const disclaimerText = "This report is generated by an AI system based on the provided health vital data and general health guidelines. It is for informational purposes only and should not be considered medical advice. Always consult with a qualified healthcare professional for any health concerns, diagnosis, or treatment plans. Do not disregard professional medical advice or delay in seeking it because of something you have read in this report.";
        const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 30);
        doc.text(disclaimerLines, 15, y);
        y += disclaimerLines.length * 4 + 10;

        // --- Footer (Consultant's Signature and Lab Info) ---
        // Ensure space for footer if a new page is needed for it
        if (y + 30 > pageHeight) { // Check if there's enough space for the footer block
            addNewPage();
        }
        
        doc.setDrawColor(0, 0, 0);
        doc.line(15, pageHeight - 45, pageWidth - 15, pageHeight - 45); // Line above signature

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        doc.text('_______________________', pageWidth - 60, pageHeight - 35); // Signature line visual
        doc.setFont('helvetica', 'bold');
        doc.text('Dr. John M.D.', pageWidth - 37.5, pageHeight - 30, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text('Consultant Pathologist', pageWidth - 37.5, pageHeight - 25, { align: 'center' });
        doc.text('MediScan AI Health Services', pageWidth - 37.5, pageHeight - 20, { align: 'center' });


        // --- Page Numbers ---
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${totalPages} | MediScan AI - Confidential`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`MediScan_Health_Report_${user?.id || 'Guest'}_${Date.now()}.pdf`);
    }
}