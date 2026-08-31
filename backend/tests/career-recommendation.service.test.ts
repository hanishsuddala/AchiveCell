import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCareerMatch, rankCareers, type CareerRequirement } from '../src/services/career-recommendation.service.js';
import { calculateSkillGaps, summarizeSkillGaps } from '../src/services/skill-gap.service.js';

const requirements: CareerRequirement[] = [
  { skillId: 1, skill: 'JavaScript', requiredLevel: 80, importance: 90 },
  { skillId: 2, skill: 'React', requiredLevel: 75, importance: 85 },
  { skillId: 3, skill: 'Node.js', requiredLevel: 70, importance: 90 },
];

test('a student with strong skills receives a 100 match score', () => {
  assert.equal(calculateCareerMatch([{ skillId: 1, proficiency: 100 }, { skillId: 2, proficiency: 80 }, { skillId: 3, proficiency: 90 }], requirements).matchScore, 100);
});

test('no matching skills and missing records are treated as zero proficiency', () => {
  const match = calculateCareerMatch([{ skillId: 99, proficiency: 100 }], requirements);
  assert.equal(match.matchScore, 0);
  assert.deepEqual(match.skills.map((skill) => skill.studentLevel), [0, 0, 0]);
  assert.deepEqual(calculateSkillGaps(match.skills).map((skill) => skill.status), ['Missing', 'Missing', 'Missing']);
});

test('partial skills use required level and importance in the weighted calculation', () => {
  const result = calculateCareerMatch([{ skillId: 1, proficiency: 60 }, { skillId: 2, proficiency: 30 }], requirements);
  assert.equal(result.skills[0].matchPercentage, 75);
  assert.equal(result.skills[1].matchPercentage, 40);
  assert.equal(result.matchScore, 38);
});

test('proficiency above and exactly at requirement are both capped at 100%', () => {
  const result = calculateCareerMatch([{ skillId: 1, proficiency: 100 }, { skillId: 2, proficiency: 75 }, { skillId: 3, proficiency: 0 }], requirements);
  assert.deepEqual(result.skills.map((skill) => skill.matchPercentage), [100, 100, 0]);
});

test('gap statuses and priority follow the documented thresholds', () => {
  const gaps = calculateSkillGaps(calculateCareerMatch([
    { skillId: 1, proficiency: 60 }, { skillId: 2, proficiency: 30 }, { skillId: 3, proficiency: 0 },
  ], requirements).skills);
  assert.deepEqual(gaps.map((gap) => gap.status), ['Needs Improvement', 'Significant Gap', 'Missing']);
  assert.equal(gaps[2].priorityScore, 63);
  assert.equal(gaps[2].priority, 'High');
  assert.deepEqual(summarizeSkillGaps(gaps), { missingSkills: 1, skillsToImprove: 2, significantGaps: 1, strongSkills: 0 });
});

test('different importance values affect ranking and ties sort by career name', () => {
  const ranked = rankCareers([{ skillId: 1, proficiency: 100 }, { skillId: 2, proficiency: 0 }], [
    { id: 1, name: 'Zeta', category: 'Test', careerSkills: [{ skillId: 1, skill: 'A', requiredLevel: 100, importance: 10 }, { skillId: 2, skill: 'B', requiredLevel: 100, importance: 90 }] },
    { id: 2, name: 'Alpha', category: 'Test', careerSkills: [{ skillId: 1, skill: 'A', requiredLevel: 100, importance: 90 }, { skillId: 2, skill: 'B', requiredLevel: 100, importance: 10 }] },
    { id: 3, name: 'Beta', category: 'Test', careerSkills: [{ skillId: 1, skill: 'A', requiredLevel: 100, importance: 50 }, { skillId: 2, skill: 'B', requiredLevel: 100, importance: 50 }] },
    { id: 4, name: 'Able', category: 'Test', careerSkills: [{ skillId: 1, skill: 'A', requiredLevel: 100, importance: 50 }, { skillId: 2, skill: 'B', requiredLevel: 100, importance: 50 }] },
  ]);
  assert.deepEqual(ranked.map(({ career, matchScore }) => [career, matchScore]), [['Alpha', 90], ['Able', 50], ['Beta', 50], ['Zeta', 10]]);
});
