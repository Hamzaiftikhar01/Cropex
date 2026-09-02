import { jsPDF } from 'jspdf';

/**
 * Helper to identify scientific pathogen name and disease class
 */
function getPathogenDetails(crop, disease) {
  const norm = (disease || '').toLowerCase();
  const cNorm = (crop || '').toLowerCase();

  if (norm.includes('bacterial') || norm.includes('xanthomonas') || cNorm.includes('cotton')) {
    return {
      type: 'Bacterial Disease',
      pathogen: 'Xanthomonas citri pv. malvacearum'
    };
  }
  if (norm.includes('early blight') || norm.includes('alternaria')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Alternaria solani'
    };
  }
  if (norm.includes('rust') || norm.includes('puccinia')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Puccinia triticina'
    };
  }
  if (norm.includes('late blight') || norm.includes('phytophthora')) {
    return {
      type: 'Oomycete Disease',
      pathogen: 'Phytophthora infestans'
    };
  }
  if (norm.includes('blast') || norm.includes('magnaporthe')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Magnaporthe oryzae'
    };
  }
  if (norm.includes('red rot') || norm.includes('colletotrichum')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Colletotrichum falcatum'
    };
  }
  if (norm.includes('northern') || norm.includes('exserohilum')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Exserohilum turcicum'
    };
  }
  return {
    type: 'Agronomic Pathology',
    pathogen: 'Pathogen visual profile identified'
  };
}

/**
 * Formats a Date object into '02 September 2026, 06:26 PM'
 */
function formatReportDate(date) {
  const d = date || new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
}

/**
 * Generates and downloads a premium, production-grade A4 portrait PDF for CROPEX.
 * Strictly fits on exactly one single A4 portrait page with zero visual clutter, no emojis,
 * elegant grid typography, subtle watermark, and enterprise-grade layout hierarchy.
 *
 * @param {Object} result - Diagnostic analysis result object
 */
export function downloadPdfReport(result) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const crop = result.cropName || result.crop || 'Cotton';
  const disease = result.disease || 'Cotton Bacterial Blight';
  const confidence = result.confidence ? `${result.confidence}%` : '91%';
  const severity = result.severity || 'Moderate';
  const { type: diseaseType, pathogen } = getPathogenDetails(crop, disease);

  const now = new Date();
  const dateStr = formatReportDate(now);
  const reportId = `CRX-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-001`;

  // Color Palette (Enterprise Ag Diagnostic Report)
  const charcoal = [30, 41, 59];        // #1e293b (deep charcoal)
  const mutedText = [100, 116, 139];    // #64748b (slate muted)
  const softLabel = [148, 163, 184];    // #94a3b8 (subtle header label)
  const brandGreen = [21, 128, 61];     // #15803d (sophisticated agri green)
  const subtleBorder = [226, 232, 240]; // #e2e8f0 (clean hairline divider)
  const cardFill = [248, 250, 249];     // #f8faf9 (subtle off-white sage tint)
  const watermarkTint = [242, 245, 243]; // very low opacity background watermark

  // 1. Subtle CROPEX Watermark behind content (Centered Vertically and Horizontally)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(68);
  doc.setTextColor(...watermarkTint);
  doc.text('CROPEX', 105, 155, { align: 'center' });

  // Margins: Left = 18mm, Right = 192mm (Width = 174mm)
  const marginL = 18;
  const marginR = 192;
  const contentWidth = 174;

  // 2. HEADER
  let y = 20;

  // Top Left: CROPEX Wordmark & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...charcoal);
  doc.text('CROPEX', marginL, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...brandGreen);
  doc.text('AI CROP HEALTH DIAGNOSTIC REPORT', marginL, y + 5);

  // Top Right: Report ID & Generation Timestamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...charcoal);
  doc.text(`REPORT ID: ${reportId}`, marginR, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text(`GENERATED: ${dateStr}`, marginR, y + 5, { align: 'right' });

  // Thin Divider Below Header
  y += 10;
  doc.setDrawColor(...subtleBorder);
  doc.setLineWidth(0.35);
  doc.line(marginL, y, marginR, y);

  // 3. DIAGNOSIS (Strongest Visual Section)
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...brandGreen);
  doc.text('DIAGNOSIS', marginL, y);

  y += 6.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...charcoal);
  doc.text(disease, marginL, y);

  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text(pathogen, marginL, y);

  // 4-Column Diagnostic Summary Card
  y += 6;
  const cardHeight = 18;
  doc.setFillColor(...cardFill);
  doc.setDrawColor(...subtleBorder);
  doc.roundedRect(marginL, y, contentWidth, cardHeight, 1.5, 1.5, 'FD');

  const colWidth = contentWidth / 4;
  const colCenters = [
    marginL + 5,
    marginL + colWidth + 2,
    marginL + colWidth * 2 + 2,
    marginL + colWidth * 3 + 2
  ];

  // Column Labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedText);
  doc.text('CROP', colCenters[0], y + 6);
  doc.text('DISEASE TYPE', colCenters[1], y + 6);
  doc.text('CONFIDENCE', colCenters[2], y + 6);
  doc.text('SEVERITY', colCenters[3], y + 6);

  // Column Values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...charcoal);
  doc.text(crop, colCenters[0], y + 12.5);
  doc.text(diseaseType, colCenters[1], y + 12.5);

  // Confidence (Subtle green emphasis)
  doc.setTextColor(...brandGreen);
  doc.text(confidence, colCenters[2], y + 12.5);

  // Severity (Subtle controlled emphasis)
  const isHighSev = severity.toLowerCase().includes('high');
  doc.setTextColor(isHighSev ? 185 : 180, isHighSev ? 28 : 83, isHighSev ? 28 : 9);
  doc.text(severity, colCenters[3], y + 12.5);

  // 4. VISIBLE SYMPTOMS
  y += cardHeight + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...brandGreen);
  doc.text('VISIBLE SYMPTOMS', marginL, y);

  y += 2.5;
  doc.setDrawColor(...subtleBorder);
  doc.setLineWidth(0.25);
  doc.line(marginL, y, marginR, y);

  const defaultSymptoms = [
    'Angular, water-soaked lesions appearing on leaves',
    'Lesions developing brown to black coloration as tissue dies',
    'Water-soaked spots may appear on bolls',
    'Severe infection may result in boll damage and lint staining'
  ];
  const symptoms = (result.visibleSymptoms && result.visibleSymptoms.length > 0)
    ? result.visibleSymptoms
    : (result.symptoms && result.symptoms.length > 0)
    ? result.symptoms
    : defaultSymptoms;

  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);

  symptoms.slice(0, 4).forEach((sym) => {
    // Minimal hairline line indicator
    doc.setDrawColor(...brandGreen);
    doc.setLineWidth(0.5);
    doc.line(marginL + 1, y - 1, marginL + 3.5, y - 1);

    doc.text(sym, marginL + 7, y);
    y += 5.2;
  });

  // 5. LIKELY CAUSES & RISK FACTORS
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...brandGreen);
  doc.text('LIKELY CAUSES & RISK FACTORS', marginL, y);

  y += 2.5;
  doc.setDrawColor(...subtleBorder);
  doc.setLineWidth(0.25);
  doc.line(marginL, y, marginR, y);

  const defaultCauses = [
    'Xanthomonas citri pv. malvacearum infection',
    'High humidity and prolonged moisture',
    'Heavy or wind-driven rainfall',
    'Infected seed or contaminated plant material',
    'Infected crop residue remaining in the field'
  ];
  const causes = (result.likelyCauses && result.likelyCauses.length > 0)
    ? result.likelyCauses
    : (result.causes && result.causes.length > 0)
    ? result.causes
    : defaultCauses;

  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);

  causes.slice(0, 5).forEach((cause) => {
    doc.setDrawColor(...brandGreen);
    doc.setLineWidth(0.5);
    doc.line(marginL + 1, y - 1, marginL + 3.5, y - 1);

    doc.text(cause, marginL + 7, y);
    y += 5.2;
  });

  // 6. PREVENTION & MANAGEMENT
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...brandGreen);
  doc.text('PREVENTION & MANAGEMENT', marginL, y);

  y += 2.5;
  doc.setDrawColor(...subtleBorder);
  doc.setLineWidth(0.25);
  doc.line(marginL, y, marginR, y);

  const defaultPrevention = [
    'Use certified, disease-free seed',
    'Select resistant cotton varieties where available',
    'Maintain good field sanitation',
    'Remove or properly manage infected crop residue',
    'Practice crop rotation with suitable non-host crops',
    'Avoid unnecessary overhead irrigation and prolonged leaf wetness'
  ];
  const prevItems = (result.recommendedActions && result.recommendedActions.length > 0)
    ? result.recommendedActions
    : (result.prevention && result.prevention.length > 0)
    ? result.prevention
    : defaultPrevention;

  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);

  prevItems.slice(0, 6).forEach((act) => {
    doc.setDrawColor(...brandGreen);
    doc.setLineWidth(0.5);
    doc.line(marginL + 1, y - 1, marginL + 3.5, y - 1);

    doc.text(act, marginL + 7, y);
    y += 5.2;
  });

  // 7. AI DIAGNOSTIC DISCLAIMER (Small subtle bordered box with neutral background)
  y += 5;
  const disclaimerH = 17;
  doc.setFillColor(...cardFill);
  doc.setDrawColor(...subtleBorder);
  doc.roundedRect(marginL, y, contentWidth, disclaimerH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedText);
  doc.text('AI DIAGNOSTIC DISCLAIMER', marginL + 5, y + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...mutedText);
  const disclaimerText = 'This assessment is based on AI-powered visual analysis. Similar symptoms may have different causes. Field verification by a qualified agricultural professional is recommended before treatment decisions.';
  const wrappedDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(wrappedDisclaimer, marginL + 5, y + 9.5);

  // 8. MINIMAL FOOTER
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...softLabel);
  doc.text('Intelligent Agricultural Decision Support', 105, 287, { align: 'center' });

  // Save the PDF
  const cleanCrop = crop.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDate = now.toISOString().split('T')[0];
  doc.save(`CROPEX_Diagnostic_Report_${cleanCrop}_${cleanDate}.pdf`);
}
