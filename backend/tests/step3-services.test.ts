import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalExplanationProvider } from '../src/services/ai-recommendation.service.js';
import { calculateAssessmentScore } from '../src/services/assessment.service.js';
import { createAuthToken, readAuthToken } from '../src/utils/auth-token.js';
import { hashPassword, verifyPassword } from '../src/utils/passwords.js';

test('password hashes verify correctly and reject a wrong password', () => {
  const hash = hashPassword('DemoPassword123!');
  assert.notEqual(hash, 'DemoPassword123!');
  assert.equal(verifyPassword('DemoPassword123!', hash), true);
  assert.equal(verifyPassword('not-the-password', hash), false);
});

test('auth tokens identify their user and reject modified tokens', () => {
  const token = createAuthToken(42);
  assert.equal(readAuthToken(token), 42);
  assert.equal(readAuthToken(`${token}x`), null);
});

test('assessment scoring is deterministic and requires one answer per question', () => {
  const answers = new Map([[1, 0], [2, 1], [3, 2]]);
  assert.equal(calculateAssessmentScore(answers, [{ questionId: 1, optionIndex: 0 }, { questionId: 2, optionIndex: 0 }, { questionId: 3, optionIndex: 2 }]), 67);
  assert.throws(() => calculateAssessmentScore(answers, [{ questionId: 1, optionIndex: 0 }]));
});

test('local AI explanation only interprets the supplied deterministic analysis', async () => {
  const provider = new LocalExplanationProvider();
  const result = await provider.explain({
    studentName: 'Ananya', careerName: 'Full Stack Developer', matchScore: 51,
    skills: [
      { skillId: 1, skill: 'Git', requiredLevel: 60, importance: 60, studentLevel: 85, gap: 0, matchPercentage: 100, status: 'Strong', priorityScore: 0, priority: 'Low' },
      { skillId: 2, skill: 'Express.js', requiredLevel: 70, importance: 80, studentLevel: 0, gap: 70, matchPercentage: 0, status: 'Missing', priorityScore: 56, priority: 'High' },
    ],
  });
  assert.equal(result.provider, 'local-deterministic');
  assert.match(result.overview, /51%/);
  assert.deepEqual(result.strengths, ['Git']);
  assert.equal(result.prioritySkills[0]?.skill, 'Express.js');
});
