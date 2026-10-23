/**
 * Phase 4 Advisor Engine Benchmark Runner
 * ========================================
 * Evaluates Cropex agronomic rules engine and ML yield predictor against 12 historical Pakistani crop seasons.
 *
 * Metrics Evaluated:
 * 1. Disease Outbreak Detection Sensitivity (True Positive Rate)
 * 2. Normal Season Specificity (True Negative Rate)
 * 3. Literature Citation Coverage (100% required)
 * 4. Yield Prediction Interval Coverage (% of historical yields within [minYield, maxYield])
 * 5. Stress Attribution Explainability Accuracy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateDiseaseRisk, calculateYieldForecast } from '../../src/utils/agriRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scenariosPath = path.join(__dirname, 'advisor_scenarios.json');
const rawData = fs.readFileSync(scenariosPath, 'utf8');
const scenarios = JSON.parse(rawData);

console.log('='.repeat(80));
console.log(' CROPEX PHASE 4 — ADVISOR ENGINE & EPIDEMIOLOGY BENCHMARK');
console.log(' Evaluating against 12 Historical Pakistani Agro-Ecological Crop Seasons');
console.log('='.repeat(80));

let outbreakTotal = 0;
let outbreakDetected = 0;
let normalTotal = 0;
let normalCorrect = 0;
let literaturePresent = 0;
let intervalCovered = 0;
let stressAttributedCorrectly = 0;
let totalScenarios = scenarios.length;

const results = [];

for (const sc of scenarios) {
  // 1. Run disease risk evaluation
  const disease = calculateDiseaseRisk(sc.cropType, sc.weather, 'en');

  // 2. Run yield forecast evaluation
  const profile = {
    cropType: sc.cropType,
    district: sc.district,
    soilType: sc.soilType,
    sowingDate: sc.sowingDate,
  };
  const yieldEst = calculateYieldForecast(profile, sc.weather, disease.percentage, 'en');

  // Evaluate Disease Sensitivity & Specificity
  let diseasePass = false;
  if (sc.expectedOutbreak) {
    outbreakTotal++;
    const diseaseNameMatches = !sc.expectedDiseaseKeyword || disease.diseaseName.includes(sc.expectedDiseaseKeyword);
    const riskMatches = disease.riskLevel === 'High' && disease.percentage >= (sc.expectedRiskMin || 70);
    if (diseaseNameMatches && riskMatches) {
      outbreakDetected++;
      diseasePass = true;
    }
  } else {
    normalTotal++;
    if (disease.riskLevel !== 'High' && disease.percentage <= (sc.expectedRiskMax || 55)) {
      normalCorrect++;
      diseasePass = true;
    }
  }

  // Evaluate Literature Citation Presence
  const hasLiterature = Boolean(disease.literatureCitation && disease.epidemiologyThreshold);
  if (hasLiterature) literaturePresent++;

  // Evaluate Yield Prediction Interval Coverage
  const actual = sc.historicalYieldReported;
  const inInterval = actual >= yieldEst.minYield && actual <= yieldEst.maxYield;
  if (inInterval) intervalCovered++;

  // Evaluate Stress Factor Attribution
  let stressPass = true;
  if (sc.expectedHeatShock && (yieldEst.stressAttribution?.heatPenalty || 0) < 10) {
    stressPass = false;
  }
  if (sc.expectedSowingPenalty && (yieldEst.stressAttribution?.sowingPenalty || 0) < 15) {
    stressPass = false;
  }
  if (sc.expectedDeltaNearBaseline && Math.abs(yieldEst.deltaFromAverage) > 12) {
    stressPass = false;
  }
  if (stressPass) stressAttributedCorrectly++;

  results.push({
    id: sc.id,
    name: sc.name,
    crop: sc.cropType,
    district: sc.district,
    diseaseDetected: `${disease.diseaseName} (${disease.percentage}%, ${disease.riskLevel})`,
    diseasePass,
    citation: disease.literatureCitation,
    forecastRange: `[${yieldEst.minYield} - ${yieldEst.maxYield}]`,
    historicalActual: actual,
    inInterval,
    stressPenalty: `Heat: -${yieldEst.stressAttribution?.heatPenalty}%, Sowing: -${yieldEst.stressAttribution?.sowingPenalty}%, Disease: -${yieldEst.stressAttribution?.diseasePenalty}%`,
    confidence: `${yieldEst.confidence}%`,
    mitigationsCount: yieldEst.mitigations?.length || 0,
  });
}

// Print Formatted Evaluation Matrix
console.log('\nSCENARIO-BY-SCENARIO EVALUATION RESULTS:');
console.log('-'.repeat(80));
results.forEach((r, idx) => {
  const statusMark = (r.diseasePass && r.inInterval) ? '[PASS]' : '[WARN]';
  console.log(`${idx + 1}. ${statusMark} ${r.name} (${r.district} - ${r.crop.toUpperCase()})`);
  console.log(`   Disease Output: ${r.diseaseDetected} | Disease Check: ${r.diseasePass ? 'PASS' : 'FAIL'}`);
  console.log(`   Yield Forecast: ${r.forecastRange} mnds/acre vs Actual: ${r.historicalActual} mnds/acre | Interval: ${r.inInterval ? 'COVERED' : 'MISS'}`);
  console.log(`   Attribution   : ${r.stressPenalty} | Conf: ${r.confidence}`);
  console.log(`   Citation      : ${r.citation}`);
  console.log('');
});

// Calculate Final Scores
const sensitivityRate = ((outbreakDetected / outbreakTotal) * 100).toFixed(1);
const specificityRate = ((normalCorrect / normalTotal) * 100).toFixed(1);
const litCoverageRate = ((literaturePresent / totalScenarios) * 100).toFixed(1);
const intervalCoverageRate = ((intervalCovered / totalScenarios) * 100).toFixed(1);
const stressAccuracyRate = ((stressAttributedCorrectly / totalScenarios) * 100).toFixed(1);

console.log('='.repeat(80));
console.log(' BENCHMARK SUMMARY SCORECARD:');
console.log('='.repeat(80));
console.log(`- Disease Outbreak Sensitivity (True Positive) : ${sensitivityRate}% (${outbreakDetected}/${outbreakTotal} epidemics detected)`);
console.log(`- Normal Season Specificity (True Negative)    : ${specificityRate}% (${normalCorrect}/${normalTotal} calm seasons without false alert)`);
console.log(`- Literature Citation Coverage                 : ${litCoverageRate}% (${literaturePresent}/${totalScenarios} backed by peer-reviewed literature)`);
console.log(`- 90% Yield Prediction Interval Coverage       : ${intervalCoverageRate}% (${intervalCovered}/${totalScenarios} historical yields within [minYield, maxYield])`);
console.log(`- Stress Factor Attribution Accuracy          : ${stressAccuracyRate}% (${stressAttributedCorrectly}/${totalScenarios} correct driver attributions)`);
console.log('='.repeat(80));

// Write JSON artifact
const summaryReport = {
  timestamp: new Date().toISOString(),
  totalScenarios,
  metrics: {
    sensitivityRate: `${sensitivityRate}%`,
    specificityRate: `${specificityRate}%`,
    litCoverageRate: `${litCoverageRate}%`,
    intervalCoverageRate: `${intervalCoverageRate}%`,
    stressAccuracyRate: `${stressAccuracyRate}%`,
  },
  detailedResults: results,
};

fs.writeFileSync(
  path.join(__dirname, 'advisor_benchmark_results.json'),
  JSON.stringify(summaryReport, null, 2)
);

console.log(`Results saved to scripts/benchmark/advisor_benchmark_results.json\n`);
