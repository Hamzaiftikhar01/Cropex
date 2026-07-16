import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a professional, structured PDF report for crop analysis.
 * Handles multiline text wrapping, multi-page overflow, and custom styled sections.
 *
 * @param {Object} result - Diagnostic analysis result object
 */
export function downloadPdfReport(result) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const crop = result.cropName || result.crop || 'Unknown Crop';
  const disease = result.disease || 'None';
  const confidence = result.confidence ? `${result.confidence}%` : 'N/A';
  const severity = result.severity || 'Low';
  const dateStr = new Date().toLocaleString();

  // Color Palette (CropMedic AI Brand Colors)
  const primaryColor = [22, 163, 74];   // #16a34a (green)
  const darkColor = [41, 37, 36];       // #292524 (dark earth)
  const lightColor = [243, 241, 237];   // #f3f1ed (light earth)
  const greyColor = [120, 113, 108];    // #78716c (neutral grey)

  // Header Title block
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CropMedic AI - Diagnostic Report', 15, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Report Generated: ${dateStr}`, 140, 25);

  // Metadata Card
  doc.setFillColor(...lightColor);
  doc.roundedRect(15, 50, 180, 30, 3, 3, 'F');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CROP TARGET:', 20, 60);
  doc.text('DIAGNOSIS:', 20, 70);
  
  doc.text('AI CONFIDENCE:', 115, 60);
  doc.text('SEVERITY LEVEL:', 115, 70);

  doc.setFont('helvetica', 'normal');
  doc.text(crop, 55, 60);
  doc.text(disease, 55, 70);
  doc.text(confidence, 155, 60);
  doc.text(severity, 155, 70);

  let y = 95;

  // Helper to add sections with word wrapping and overflow checks
  const addSection = (title, content, bulleted = false) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(title, 15, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);

    if (bulleted && Array.isArray(content)) {
      content.forEach(item => {
        const textLines = doc.splitTextToSize(`• ${item}`, 170);
        textLines.forEach(line => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 20, y);
          y += 5.5;
        });
      });
      y += 2;
    } else {
      const textLines = doc.splitTextToSize(content || 'No details available.', 175);
      textLines.forEach(line => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15, y);
        y += 5.5;
      });
      y += 4;
    }
  };

  // 1. Description
  const desc = result.description || result.analysisSummary;
  addSection('Condition Description', desc);

  // 2. Symptoms
  const symptomsList = result.symptoms || result.visibleSymptoms || [];
  addSection('Visible Symptoms', symptomsList, true);

  // 3. Causes
  const causesList = result.causes || result.likelyCauses || [];
  addSection('Likely Causes', causesList, true);

  // 4. Prevention
  const prevList = result.prevention || result.recommendedActions || [];
  addSection('Prevention & Immediate Actions', prevList, true);

  // 5. Best Practices
  const bpList = result.bestPractices || [];
  addSection('Best Farming Practices', bpList, true);

  // 6. Recommended Products
  const products = result.recommendedProducts || [];
  if (products.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Recommended Crop Protection Products', 15, y);
    y += 8;

    products.forEach(p => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text(`${p.name} (${p.productType}) - ${p.companyName || p.company}`, 15, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...greyColor);
      if (p.activeIngredient) {
        doc.text(`Active Ingredient: ${p.activeIngredient}`, 15, y);
        y += 4;
      }
      
      const pDesc = p.description || p.notes || 'Registered chemical/biological control product.';
      const pLines = doc.splitTextToSize(pDesc, 175);
      pLines.forEach(line => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15, y);
        y += 4.5;
      });

      // Link text
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'oblique');
      doc.text(`Official Link: ${p.officialProductUrl}`, 15, y);
      y += 8;
    });
  }

  // Footer / Disclaimer
  if (y > 265) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(...lightColor);
  doc.line(15, y, 195, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...greyColor);
  doc.text('DISCLAIMER:', 15, y);
  
  doc.setFont('helvetica', 'normal');
  const disclaimerText = 'CropMedic AI recommendations are for educational and informational purposes only. Farmers should consult with local agricultural experts and always review and follow instructions on official manufacturer product labels before any chemical application.';
  const discLines = doc.splitTextToSize(disclaimerText, 175);
  discLines.forEach(line => {
    y += 4;
    if (y > 285) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 15, y);
  });

  // Save the PDF
  const cleanCrop = crop.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDate = dateStr.replace(/[\/:\s,]/g, '_');
  doc.save(`CropMedic_Report_${cleanCrop}_${cleanDate}.pdf`);
}
