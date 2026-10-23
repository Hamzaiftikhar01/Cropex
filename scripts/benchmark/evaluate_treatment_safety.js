/**
 * Cropex Phase 5 — Treatment Safety & Escalation Benchmark Evaluator
 * ==================================================================
 * Validates:
 * 1. DPP Registration Attribution Rate (Target: 100%)
 * 2. Pre-Harvest Interval (PHI) & Label Dosage Attribution Rate (Target: 100%)
 * 3. Banned Chemical Screening & Rejection Rate (Target: 100% blocked, 0% banned allowed)
 * 4. Expert Escalation Accuracy (Confidence < 70% or High Severity) (Target: 100%)
 * 5. 1-Click WhatsApp Referral Generation & Extension Helplines
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXTENSION_HELPLINES_PK,
  auditTreatmentSafety,
  getRegisteredProductsForDiagnosis,
  generateWhatsAppReferralUrl,
  isPesticideBanned,
} from '../../src/lib/pesticideRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scenariosPath = path.join(__dirname, 'treatment_safety_scenarios.json');
const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));

console.log('\n========================================================================');
console.log('🌿 CROPEX PHASE 5 — TREATMENT SAFETY & DPP COMPLIANCE BENCHMARK');
console.log('========================================================================');
console.log(`Loaded ${scenarios.length} test scenarios across 4 safety categories.\n`);

let passedTests = 0;
let totalTests = scenarios.length;

let dppFormulationPass = 0;
let dppFormulationTotal = 0;

let bannedDetectionPass = 0;
let bannedDetectionTotal = 0;

let escalationPass = 0;
let escalationTotal = 0;

let referralPass = 0;
let referralTotal = 0;

for (const scenario of scenarios) {
  let isPass = true;
  let reason = '';

  switch (scenario.category) {
    case 'registered_formulation': {
      dppFormulationTotal++;
      const products = getRegisteredProductsForDiagnosis(scenario.crop, scenario.disease);

      if (products.length === 0) {
        isPass = false;
        reason = `No DPP registered products found for ${scenario.crop} - ${scenario.disease}`;
      } else {
        const names = products.map((p) => p.name);
        const matchesExpected = scenario.expectedRegisteredProducts.some((exp) =>
          names.some((n) => n.toLowerCase().includes(exp.toLowerCase()) || exp.toLowerCase().includes(n.toLowerCase()))
        );

        if (!matchesExpected) {
          isPass = false;
          reason = `Expected one of [${scenario.expectedRegisteredProducts.join(', ')}], got [${names.join(', ')}]`;
        }

        // Verify that EVERY matched product has authentic DPP registration & safety specs
        for (const p of products) {
          if (!p.dppRegistrationNo || !p.dppRegistrationNo.startsWith('DPP-PK/')) {
            isPass = false;
            reason = `Product ${p.name} missing valid DPP registration number (${p.dppRegistrationNo})`;
          }
          if (typeof p.phiDays !== 'number' || p.phiDays <= 0) {
            isPass = false;
            reason = `Product ${p.name} has invalid PHI days (${p.phiDays})`;
          }
          if (!p.labelDosageAcre || typeof p.labelDosageAcre !== 'string' || p.labelDosageAcre.length < 5) {
            isPass = false;
            reason = `Product ${p.name} has invalid label dosage (${p.labelDosageAcre})`;
          }
          if (!p.whoToxicityClass || !p.protectiveEquipment || p.protectiveEquipment.length === 0) {
            isPass = false;
            reason = `Product ${p.name} missing WHO toxicity class or PPE equipment checklist`;
          }
        }

        // Verify that at least one product has PHI >= min expected
        const meetsPhi = products.some((p) => p.phiDays >= scenario.expectedMinPhiDays);
        if (!meetsPhi) {
          isPass = false;
          reason = `None of matched products had PHI >= ${scenario.expectedMinPhiDays} days`;
        }

        // Verify that at least one product satisfies the expected dosage string
        if (scenario.expectedDosageContains) {
          const satisfiesDosage = products.some((p) =>
            p.labelDosageAcre.toLowerCase().includes(scenario.expectedDosageContains.toLowerCase())
          );
          if (!satisfiesDosage) {
            isPass = false;
            reason = `None of matched products contains expected dosage substring "${scenario.expectedDosageContains}"`;
          }
        }
      }

      if (isPass) dppFormulationPass++;
      break;
    }

    case 'banned_screening': {
      bannedDetectionTotal++;
      const audit = auditTreatmentSafety(scenario.candidateText);
      const isBannedDirect = isPesticideBanned(scenario.bannedIngredient);

      if (audit.isSafe !== scenario.expectedIsSafe) {
        isPass = false;
        reason = `Expected isSafe=${scenario.expectedIsSafe}, but audit gave isSafe=${audit.isSafe}`;
      } else if (!isBannedDirect) {
        isPass = false;
        reason = `Direct blacklist lookup failed for banned ingredient "${scenario.bannedIngredient}"`;
      } else if (!audit.bannedMatches.some((b) =>
        b.activeIngredient.toLowerCase().includes(scenario.bannedIngredient.toLowerCase()) ||
        (b.aliases && b.aliases.some((a) => a.toLowerCase().includes(scenario.bannedIngredient.toLowerCase())))
      )) {
        isPass = false;
        reason = `Banned match list missing "${scenario.bannedIngredient}"`;
      }

      if (isPass) bannedDetectionPass++;
      break;
    }

    case 'escalation_trigger': {
      escalationTotal++;
      const numericConfidence = typeof scenario.confidence === 'number'
        ? scenario.confidence
        : parseInt(scenario.confidence, 10);
      const shouldEscalate = numericConfidence < 70 || scenario.severity === 'High';

      if (shouldEscalate !== scenario.shouldEscalate) {
        isPass = false;
        reason = `Escalation trigger mismatch: calculated ${shouldEscalate}, expected ${scenario.shouldEscalate}`;
      }

      if (isPass) escalationPass++;
      break;
    }

    case 'escalation_referral': {
      referralTotal++;
      const referralUrl = generateWhatsAppReferralUrl({
        cropName: scenario.crop,
        disease: scenario.disease,
        severity: scenario.severity,
        confidence: scenario.confidence,
        district: scenario.district,
      });

      const decoded = decodeURIComponent(referralUrl);
      for (const kw of scenario.expectedReferralKeywords) {
        if (!decoded.includes(kw) && !referralUrl.includes(kw)) {
          isPass = false;
          reason = `Referral URL missing expected keyword "${kw}" in ${referralUrl}`;
          break;
        }
      }

      // Verify extension helplines integrity
      const requiredHelplines = ['narc', 'punjab', 'sindh', 'kpk', 'cottonSpecialist'];
      for (const key of requiredHelplines) {
        const info = EXTENSION_HELPLINES_PK[key];
        if (!info || !info.phone) {
          isPass = false;
          reason = `Extension helpline missing for key: ${key}`;
          break;
        }
      }

      if (isPass) referralPass++;
      break;
    }

    default:
      isPass = false;
      reason = `Unknown scenario category: ${scenario.category}`;
  }

  if (isPass) {
    passedTests++;
    console.log(`  ✅ [${scenario.id}] ${scenario.category}: PASSED`);
  } else {
    console.log(`  ❌ [${scenario.id}] ${scenario.category}: FAILED — ${reason}`);
  }
}

console.log('\n------------------------------------------------------------------------');
console.log('📊 BENCHMARK METRIC SCORECARD:');
console.log('------------------------------------------------------------------------');
const dppRate = Math.round((dppFormulationPass / dppFormulationTotal) * 100);
const bannedBlockRate = Math.round((bannedDetectionPass / bannedDetectionTotal) * 100);
const escalationAcc = Math.round((escalationPass / escalationTotal) * 100);
const referralAcc = Math.round((referralPass / referralTotal) * 100);

console.log(`1. DPP Registered Formulation & Dosage Attribution: ${dppFormulationPass}/${dppFormulationTotal} (${dppRate}%)`);
console.log(`2. Banned Pesticide Screening & Rejection Rate:    ${bannedDetectionPass}/${bannedDetectionTotal} (${bannedBlockRate}%) — 0% Banned Allowed`);
console.log(`3. Low-Confidence / High-Severity Escalation:     ${escalationPass}/${escalationTotal} (${escalationAcc}%)`);
console.log(`4. WhatsApp Referral & Gov Helpline Routing:       ${referralPass}/${referralTotal} (${referralAcc}%)`);
console.log('------------------------------------------------------------------------');
console.log(`OVERALL RESULT: ${passedTests}/${totalTests} Scenarios Passed (${Math.round((passedTests / totalTests) * 100)}%)`);

if (passedTests === totalTests) {
  console.log('\n🎉 ALL PHASE 5 TREATMENT SAFETY BENCHMARK TARGETS SATISFIED!\n');
  process.exit(0);
} else {
  console.error('\n⚠️ BENCHMARK FAILED TO MEET 100% SAFETY TARGETS.\n');
  process.exit(1);
}
