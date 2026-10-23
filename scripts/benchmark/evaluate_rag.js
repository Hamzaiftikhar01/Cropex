/**
 * Cropex Phase 3 — RAG Knowledge Base Retrieval Benchmark Runner
 * ==============================================================
 * Evaluates search accuracy, Top-1 and Top-3 retrieval hit rates, and
 * answer keyword coverage against the 50-item Golden QA dataset.
 *
 * Usage:
 *   node scripts/benchmark/evaluate_rag.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchKnowledgeBase } from '../../src/lib/ragSearch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.resolve(__dirname, './rag_golden_qa.json');
const rawData = fs.readFileSync(DATASET_PATH, 'utf8');
const testCases = JSON.parse(rawData);

console.log(`\n============================================================`);
console.log(`🌾 Cropex RAG Evaluation Harness — Phase 3 Benchmark`);
console.log(`============================================================`);
console.log(`Loaded ${testCases.length} golden Q&A evaluation pairs.\n`);

let top1Hits = 0;
let top3Hits = 0;
let keywordHitsTotal = 0;
let keywordPossiblesTotal = 0;

const failures = [];

testCases.forEach((tc, idx) => {
  const result = searchKnowledgeBase(tc.question, {
    cropId: tc.crop_id,
    limit: 3,
  });

  const retrievedIds = result.results.map((r) => r.chunk.id);
  const top1Id = retrievedIds[0] || null;

  // Hit tests
  const isTop1Hit = tc.expected_chunk_ids.includes(top1Id);
  const isTop3Hit = retrievedIds.some((id) => tc.expected_chunk_ids.includes(id));

  if (isTop1Hit) top1Hits++;
  if (isTop3Hit) top3Hits++;

  // Keyword coverage in retrieved content
  const combinedContent = result.results
    .map((r) => `${r.chunk.title} ${r.chunk.content} ${r.chunk.content_ur || ''}`)
    .join(' ')
    .toLowerCase();

  const kwFound = tc.expected_answer_keywords.filter((kw) =>
    combinedContent.includes(kw.toLowerCase())
  );
  keywordHitsTotal += kwFound.length;
  keywordPossiblesTotal += tc.expected_answer_keywords.length;

  if (!isTop3Hit) {
    failures.push({
      id: tc.id,
      question: tc.question,
      expected: tc.expected_chunk_ids,
      got: retrievedIds,
      scores: result.results.map((r) => r.score),
    });
  }
});

const top1Rate = ((top1Hits / testCases.length) * 100).toFixed(1);
const top3Rate = ((top3Hits / testCases.length) * 100).toFixed(1);
const kwRate = ((keywordHitsTotal / keywordPossiblesTotal) * 100).toFixed(1);

console.log(`📊 BENCHMARK RESULTS:`);
console.log(`------------------------------------------------------------`);
console.log(`Total Test Queries:        ${testCases.length}`);
console.log(`Top-1 Hit Rate:            ${top1Hits}/${testCases.length} (${top1Rate}%)`);
console.log(`Top-3 Hit Rate:            ${top3Hits}/${testCases.length} (${top3Rate}%)`);
console.log(`Keyword Faithfulness:      ${keywordHitsTotal}/${keywordPossiblesTotal} (${kwRate}%)`);
console.log(`------------------------------------------------------------`);

if (failures.length > 0) {
  console.log(`\n⚠️ ${failures.length} query retrievals fell outside Top-3:`);
  failures.forEach((f) => {
    console.log(` - [${f.id}] "${f.question}"`);
    console.log(`   Expected: ${f.expected.join(', ')}`);
    console.log(`   Got:      ${f.got.join(', ') || 'NONE'}`);
  });
} else {
  console.log(`\n🎉 PERFECT SCORE! All 50 queries retrieved an authoritative chunk in Top-3!`);
}

// Write benchmark scorecard artifact
const scorecard = {
  timestamp: new Date().toISOString(),
  testQueryCount: testCases.length,
  top1HitRate: `${top1Rate}%`,
  top3HitRate: `${top3Rate}%`,
  keywordCoverage: `${kwRate}%`,
  failuresCount: failures.length,
};

const scorecardPath = path.resolve(__dirname, './rag_scorecard.json');
fs.writeFileSync(scorecardPath, JSON.stringify(scorecard, null, 2), 'utf8');
console.log(`Scorecard saved to: ${scorecardPath}\n`);
