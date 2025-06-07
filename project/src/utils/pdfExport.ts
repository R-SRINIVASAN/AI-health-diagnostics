import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFExportUtil {
  static async generatePDF(elementId: string, title: string, filename?: string): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }

      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' });
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray color
      const now = new Date().toLocaleString();
      pdf.text(`Generated on: ${now}`, pdfWidth / 2, 30, { align: 'center' });
      
      // Add content
      let yPosition = 40;
      
      if (imgHeight > pdfHeight - yPosition - 10) {
        // If content is too tall, split across pages
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
          
          // Create a temporary canvas for this page
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
      
      // Add footer
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
      
      // Save the PDF
      const pdfFilename = filename || `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      pdf.save(pdfFilename);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  static async generateReportPDF(data: any, reportType: string): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246);
    pdf.text('MediScan AI', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${reportType} Report`, pageWidth / 2, 35, { align: 'center' });
    
    // Timestamp
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    const now = new Date().toLocaleString();
    pdf.text(`Generated: ${now}`, 20, 50);
    
    let yPos = 70;
    
    // Content based on report type
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFont(undefined, 'bold');
        pdf.text(`${key}:`, 20, yPos);
        pdf.setFont(undefined, 'normal');
        
        const valueStr = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        const lines = pdf.splitTextToSize(valueStr, pageWidth - 40);
        
        yPos += 7;
        lines.forEach((line: string) => {
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(line, 25, yPos);
          yPos += 5;
        });
        
        yPos += 5;
      });
    }
    
    pdf.save(`${reportType}_Report_${Date.now()}.pdf`);
  }
}