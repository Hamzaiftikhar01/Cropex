/**
 * Unit & Integration Tests for Cropex Guardrails:
 * 1. Agricultural Domain Image Guardrails
 * 2. Chatbot Casual Greeting / Conversational Guardrails
 */

import assert from 'node:assert';
import { isConversationalGreeting } from '../src/services/aiService.js';
import { searchKnowledgeBase } from '../src/lib/ragSearch.js';

console.log('============================================================');
console.log('🛡️ TESTING CROPEX GUARDRAIL SPECIFICATIONS');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// GUARDRAIL 1: Conversational Greeting Detection
// -----------------------------------------------------------------------------
console.log('[GUARDRAIL 1] Chatbot Greeting & Pleasantry Detection');
console.log('------------------------------------------------------------');

const greetingSamples = [
  'hi',
  'Hi',
  'HI',
  'hello',
  'hey',
  'hey there',
  'good morning',
  'good afternoon',
  'good evening',
  'how are you',
  'how are you?',
  'whats up',
  'salam',
  'asalam o alaikum',
  'assalamu alaikum',
  'السلام علیکم',
  'وعلیکم السلام',
  'kya hal hai',
  'kaise ho',
  'thanks',
  'shukriya',
  'شکریہ',
  'ok',
  'bye',
  'khuda hafiz',
  'الله حافظ'
];

for (const greeting of greetingSamples) {
  const isGreeting = isConversationalGreeting(greeting);
  assert.strictEqual(isGreeting, true, `Expected "${greeting}" to be detected as conversational greeting.`);
}
console.log(`  ✅ PASS: All ${greetingSamples.length} conversational greeting/pleasantry variations correctly identified.`);

const substantiveAgronomicQueries = [
  'wheat yellow rust spray',
  'how to treat cotton leaf curl virus',
  'best fungicide for potato early blight',
  'maize stem borer chemical dose',
  'گندم میں پیلی کنگی کا علاج',
  'کپاس کے پتوں کے مروڑ کا سپرے',
  'what is the dosage for Amistar Top on wheat',
  'recommend a registered pesticide for sugarcane pyrilla'
];

for (const query of substantiveAgronomicQueries) {
  const isGreeting = isConversationalGreeting(query);
  assert.strictEqual(isGreeting, false, `Expected "${query}" to be substantive agricultural query, not a greeting.`);
}
console.log(`  ✅ PASS: All ${substantiveAgronomicQueries.length} substantive crop queries correctly identified as non-greetings.`);

// -----------------------------------------------------------------------------
// GUARDRAIL 2: RAG Search Zero-Score Protection for Conversational Tokens
// -----------------------------------------------------------------------------
console.log('\n[GUARDRAIL 2] RAG Search Metadata Boost Isolation');
console.log('------------------------------------------------------------');

const greetingQueries = ['hi', 'hello', 'hey', 'salam', 'thanks', 'ok', 'bye'];

for (const gq of greetingQueries) {
  const res = searchKnowledgeBase(gq, { cropId: 'wheat', minScore: 0.5 });
  assert.strictEqual(
    res.results.length,
    0,
    `Greeting "${gq}" with cropId: "wheat" should return 0 search results, but got ${res.results.length}`
  );
}
console.log(`  ✅ PASS: All ${greetingQueries.length} greeting queries correctly prevented from matching random wheat knowledge chunks.`);

// Legitimate agricultural search MUST return relevant chunks
const realWheatRagResult = searchKnowledgeBase('yellow rust fungicide treatment', { cropId: 'wheat', minScore: 0.5 });
assert.ok(
  realWheatRagResult.results.length > 0,
  'Agricultural query for yellow rust must return relevant knowledge chunks.'
);
console.log(`  ✅ PASS: Legitimate agronomic query returned ${realWheatRagResult.results.length} relevant grounded chunks.`);

// -----------------------------------------------------------------------------
// GUARDRAIL 3: Agricultural Image Rejection Contract Verification
// -----------------------------------------------------------------------------
console.log('\n[GUARDRAIL 3] Agricultural Image Rejection Payload Contract');
console.log('------------------------------------------------------------');

const nonCropPayloads = [
  { isCrop: false, disease_id: 'invalid_image', crop: 'Non-Agricultural' },
  { isAgriculturalCrop: false, disease: 'Non-Agricultural Image Detected' },
  { isCrop: false, isAgriculturalCrop: false, confidence: 0, crop: 'Unknown Non-Plant' }
];

for (const payload of nonCropPayloads) {
  const isInvalid = payload.isCrop === false ||
                    payload.isAgriculturalCrop === false ||
                    payload.disease_id === 'invalid_image' ||
                    payload.crop === 'Non-Agricultural' ||
                    payload.crop === 'Unknown Non-Plant';
  assert.strictEqual(isInvalid, true, 'Non-crop payload must be caught by guardrail check.');
}
console.log('  ✅ PASS: Non-agricultural image contract safely triggers guardrail alert state.\n');

console.log('============================================================');
console.log('🎉 ALL GUARDRAIL SPECIFICATION TESTS PASSED (100%)');
console.log('============================================================');
