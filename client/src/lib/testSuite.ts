import {
  processBall,
  calculateRunRate,
  calculateRequiredRunRate,
  calculateStrikeRate,
  calculateEconomy,
  isValidHandNumber,
  generateRoomCode,
  HandNumber,
} from '@hcl/shared';
import {
  createOfflineMatch,
  simulateBall,
  simulateRandomBall,
  simulateInnings,
  simulateFullMatch,
} from './offlineEngine';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

function runTest(name: string, fn: () => void): TestResult {
  const start = performance.now();
  try {
    fn();
    return { name, passed: true, message: 'OK', duration: performance.now() - start };
  } catch (e) {
    return {
      name,
      passed: false,
      message: (e as Error).message,
      duration: performance.now() - start,
    };
  }
}

export function runAllTests(): TestResult[] {
  const results: TestResult[] = [];

  // Ball processing
  results.push(
    runTest('OUT when numbers match', () => {
      const r = processBall(4, 4);
      if (!r.isWicket || r.runs !== 0) throw new Error('Expected OUT');
    })
  );

  results.push(
    runTest('Runs = batsman number when differ', () => {
      const r = processBall(2, 5);
      if (r.runs !== 5 || r.isWicket) throw new Error('Expected 5 runs');
    })
  );

  results.push(
    runTest('Zero runs on OUT', () => {
      const r = processBall(0, 0);
      if (!r.isWicket) throw new Error('Expected wicket');
    })
  );

  // Run rate
  results.push(
    runTest('Run rate calculation', () => {
      const rr = calculateRunRate(12, 2, 0);
      if (rr !== 6) throw new Error(`Expected 6, got ${rr}`);
    })
  );

  results.push(
    runTest('Run rate at start is 0', () => {
      if (calculateRunRate(0, 0, 0) !== 0) throw new Error('Expected 0');
    })
  );

  // Required run rate
  results.push(
    runTest('Required run rate', () => {
      const rrr = calculateRequiredRunRate(50, 30, 5, 0);
      if (rrr <= 0) throw new Error('RRR should be positive');
    })
  );

  // Strike rate & economy
  results.push(
    runTest('Strike rate', () => {
      if (calculateStrikeRate(50, 25) !== 200) throw new Error('Expected 200');
    })
  );

  results.push(
    runTest('Economy', () => {
      if (calculateEconomy(24, 24) !== 6) throw new Error('Expected 6');
    })
  );

  // Hand number validation
  results.push(
    runTest('Valid hand numbers 0-6', () => {
      for (let i = 0; i <= 6; i++) {
        if (!isValidHandNumber(i)) throw new Error(`${i} should be valid`);
      }
      if (isValidHandNumber(7)) throw new Error('7 should be invalid');
    })
  );

  // Room code generation
  results.push(
    runTest('Room code length', () => {
      const code = generateRoomCode();
      if (code.length !== 6) throw new Error(`Expected 6 chars, got ${code.length}`);
    })
  );

  results.push(
    runTest('Stress: 100 room codes unique', () => {
      const codes = new Set(Array.from({ length: 100 }, () => generateRoomCode()));
      if (codes.size < 95) throw new Error('Too many collisions');
    })
  );

  // 50 ball simulations
  results.push(
    runTest('50 automatic ball simulations', () => {
      let state = createOfflineMatch('T10', 2, 10);
      for (let i = 0; i < 50; i++) {
        const bowler = (i % 7) as HandNumber;
        const batsman = ((i + 3) % 7) as HandNumber;
        const { state: next } = simulateBall(state, bowler, batsman);
        state = next;
        if (state.phase === 'result') break;
      }
      if (state.balls.length === 0) throw new Error('No balls recorded');
    })
  );

  // Random match
  results.push(
    runTest('Random full match simulation', () => {
      const state = simulateFullMatch('T10', 2);
      if (state.phase !== 'result' || !state.result) throw new Error('Match did not complete');
      if (state.innings.length < 2) throw new Error('Expected 2 innings');
    })
  );

  // Random innings
  results.push(
    runTest('Random innings simulation', () => {
      let state = createOfflineMatch('T10', 2, 10);
      state = simulateInnings(state);
      const inn = state.innings[0];
      if (!inn.isComplete && inn.overs === 0 && inn.wickets === 0) {
        throw new Error('Innings should have progress');
      }
    })
  );

  // Wicket tracking
  results.push(
    runTest('Wicket increments on matching numbers', () => {
      let state = createOfflineMatch('T10', 2, 10);
      const { state: next } = simulateBall(state, 3, 3);
      if (next.innings[0].wickets !== 1) throw new Error('Wicket not counted');
    })
  );

  // Score tracking
  results.push(
    runTest('Score increments on runs', () => {
      let state = createOfflineMatch('T10', 2, 10);
      const { state: next } = simulateBall(state, 1, 6);
      if (next.innings[0].runs !== 6) throw new Error(`Expected 6 runs, got ${next.innings[0].runs}`);
    })
  );

  // Over progression
  results.push(
    runTest('Over increments after 6 balls', () => {
      let state = createOfflineMatch('T10', 2, 10);
      for (let i = 0; i < 6; i++) {
        const { state: next } = simulateBall(state, 1, 2);
        state = next;
      }
      if (state.innings[0].overs !== 1) throw new Error('Expected 1 over');
      if (state.innings[0].balls !== 0) throw new Error('Expected 0 balls in over');
    })
  );

  // Stress score calculations
  results.push(
    runTest('Stress: 1000 run rate calculations', () => {
      for (let i = 1; i <= 1000; i++) {
        calculateRunRate(i * 2, Math.floor(i / 6), i % 6);
      }
    })
  );

  // Random ball stress
  results.push(
    runTest('Stress: 200 random balls', () => {
      let state = createOfflineMatch('T10', 2, 5);
      for (let i = 0; i < 200; i++) {
        const { state: next } = simulateRandomBall(state);
        state = next;
        if (state.phase === 'result') break;
      }
    })
  );

  return results;
}
