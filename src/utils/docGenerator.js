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
 * Generates and downloads a clean, professional Word (.doc) diagnostic report for CROPEX.
 *
 * @param {Object} result - Diagnostic analysis result object
 */
export function downloadWordReport(result) {
  const crop = result.cropName || result.crop || 'Cotton';
  const disease = result.disease || 'Cotton Bacterial Blight';
  const confidence = result.confidence ? `${result.confidence}%` : '91%';
  const severity = result.severity || 'Moderate';
  const { type: diseaseType, pathogen } = getPathogenDetails(crop, disease);

  const now = new Date();
  const dateStr = formatReportDate(now);
  const reportId = `CRX-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-001`;

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

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>CROPEX AI Crop Health Diagnostic Report</title>
  <style>
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      margin: 36px;
      background-color: #ffffff;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .brand-title {
      font-size: 16pt;
      font-weight: bold;
      color: #1e293b;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 8.5pt;
      font-weight: bold;
      color: #15803d;
      margin-top: 2px;
    }
    .meta-id {
      font-size: 8pt;
      font-weight: bold;
      color: #1e293b;
      text-align: right;
    }
    .meta-date {
      font-size: 8pt;
      color: #64748b;
      text-align: right;
      margin-top: 2px;
    }
    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin-top: 12px;
      margin-bottom: 18px;
    }
    .diag-label {
      font-size: 8pt;
      font-weight: bold;
      color: #15803d;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .diag-title {
      font-size: 20pt;
      font-weight: bold;
      color: #0f172a;
      margin: 0;
    }
    .diag-pathogen {
      font-size: 10pt;
      font-style: italic;
      color: #64748b;
      margin-top: 2px;
      margin-bottom: 14px;
    }
    .summary-card {
      width: 100%;
      border-collapse: collapse;
      background-color: #f8faf9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin-bottom: 22px;
    }
    .summary-card td {
      padding: 10px 14px;
      width: 25%;
      vertical-align: top;
    }
    .card-label {
      font-size: 7.5pt;
      font-weight: bold;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .card-val {
      font-size: 10pt;
      font-weight: bold;
      color: #1e293b;
    }
    .section-title {
      font-size: 9.5pt;
      font-weight: bold;
      color: #15803d;
      letter-spacing: 0.5px;
      margin-top: 18px;
      margin-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    ul {
      margin-top: 6px;
      margin-bottom: 16px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
      font-size: 9.5pt;
      color: #1e293b;
    }
    .disclaimer-card {
      background-color: #f8faf9;
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      margin-top: 25px;
      border-radius: 4px;
    }
    .disclaimer-title {
      font-size: 7.5pt;
      font-weight: bold;
      color: #64748b;
      margin-bottom: 3px;
    }
    .disclaimer-text {
      font-size: 8pt;
      color: #64748b;
      line-height: 1.4;
      margin: 0;
    }
    .footer-text {
      text-align: center;
      font-size: 8pt;
      color: #94a3b8;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="vertical-align: top;">
        <div class="brand-title">CROPEX</div>
        <div class="brand-sub">AI CROP HEALTH DIAGNOSTIC REPORT</div>
      </td>
      <td style="vertical-align: top;">
        <div class="meta-id">REPORT ID: ${reportId}</div>
        <div class="meta-date">GENERATED: ${dateStr}</div>
      </td>
    </tr>
  </table>

  <hr class="divider" />

  <div class="diag-label">DIAGNOSIS</div>
  <div class="diag-title">${disease}</div>
  <div class="diag-pathogen">${pathogen}</div>

  <table class="summary-card">
    <tr>
      <td>
        <div class="card-label">CROP</div>
        <div class="card-val">${crop}</div>
      </td>
      <td>
        <div class="card-label">DISEASE TYPE</div>
        <div class="card-val">${diseaseType}</div>
      </td>
      <td>
        <div class="card-label">CONFIDENCE</div>
        <div class="card-val" style="color: #15803d;">${confidence}</div>
      </td>
      <td>
        <div class="card-label">SEVERITY</div>
        <div class="card-val" style="color: #b45309;">${severity}</div>
      </td>
    </tr>
  </table>

  <div class="section-title">VISIBLE SYMPTOMS</div>
  <ul>
    ${symptoms.slice(0, 4).map(s => `<li>${s}</li>`).join('')}
  </ul>

  <div class="section-title">LIKELY CAUSES & RISK FACTORS</div>
  <ul>
    ${causes.slice(0, 5).map(c => `<li>${c}</li>`).join('')}
  </ul>

  <div class="section-title">PREVENTION & MANAGEMENT</div>
  <ul>
    ${prevItems.slice(0, 6).map(p => `<li>${p}</li>`).join('')}
  </ul>

  <div class="disclaimer-card">
    <div class="disclaimer-title">AI DIAGNOSTIC DISCLAIMER</div>
    <p class="disclaimer-text">
      This assessment is based on AI-powered visual analysis. Similar symptoms may have different causes. Field verification by a qualified agricultural professional is recommended before treatment decisions.
    </p>
  </div>

  <div class="footer-text">
    Intelligent Agricultural Decision Support
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanCrop = crop.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDate = now.toISOString().split('T')[0];
  a.href = url;
  a.download = `CROPEX_Diagnostic_Report_${cleanCrop}_${cleanDate}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
