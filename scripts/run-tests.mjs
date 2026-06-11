/**
 * CLI test runner — unit tests + Socket.IO integration (server on :3001)
 */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { io } = require('socket.io-client');
const shared = require('../shared/dist/index.js');

const {
  processBall,
  calculateRunRate,
  calculateRequiredRunRate,
  calculateStrikeRate,
  calculateEconomy,
  isValidHandNumber,
  generateRoomCode,
} = shared;

const SERVER = process.env.SERVER_URL || 'http://localhost:3001';
const TOSS_DELAY = 3200;

function runTest(name, fn) {
  const start = performance.now();
  try {
    fn();
    return { name, passed: true, message: 'OK', duration: performance.now() - start };
  } catch (e) {
    return { name, passed: false, message: e.message, duration: performance.now() - start };
  }
}

function runUnitTests() {
  const results = [];
  results.push(runTest('OUT when numbers match', () => {
    const r = processBall(4, 4);
    if (!r.isWicket || r.runs !== 0) throw new Error('Expected OUT');
  }));
  results.push(runTest('Runs = batsman number when differ', () => {
    const r = processBall(2, 5);
    if (r.runs !== 5 || r.isWicket) throw new Error('Expected 5 runs');
  }));
  results.push(runTest('Run rate calculation', () => {
    if (calculateRunRate(12, 2, 0) !== 6) throw new Error('Expected RR 6');
  }));
  results.push(runTest('Required run rate positive', () => {
    if (calculateRequiredRunRate(50, 30, 5, 0) <= 0) throw new Error('RRR should be > 0');
  }));
  results.push(runTest('Strike rate', () => {
    if (calculateStrikeRate(50, 25) !== 200) throw new Error('Expected 200');
  }));
  results.push(runTest('Economy', () => {
    if (calculateEconomy(24, 24) !== 6) throw new Error('Expected 6');
  }));
  results.push(runTest('Hand numbers 0-6 valid', () => {
    for (let i = 0; i <= 6; i++) if (!isValidHandNumber(i)) throw new Error(`${i} invalid`);
    if (isValidHandNumber(7)) throw new Error('7 should be invalid');
  }));
  results.push(runTest('Room code length', () => {
    if (generateRoomCode().length !== 6) throw new Error('Bad code length');
  }));
  results.push(runTest('Stress: 100 unique room codes', () => {
    if (new Set(Array.from({ length: 100 }, () => generateRoomCode())).size < 95) {
      throw new Error('Too many collisions');
    }
  }));
  results.push(runTest('50 ball logic simulations', () => {
    for (let i = 0; i < 50; i++) processBall(i % 7, (i + 3) % 7);
  }));
  return results;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function connectClient() {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER, { transports: ['websocket'], forceNew: true });
    const t = setTimeout(() => reject(new Error('connect timeout')), 5000);
    socket.on('connect', () => { clearTimeout(t); resolve(socket); });
    socket.on('connect_error', (e) => { clearTimeout(t); reject(e); });
  });
}

function once(socket, event, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout: ${event}`)), timeoutMs);
    socket.once(event, (data) => { clearTimeout(t); resolve(data); });
  });
}

function onceError(socket, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), timeoutMs);
    socket.once('error', (msg) => { clearTimeout(t); resolve(msg); });
  });
}

async function runSocketIntegration() {
  const results = [];
  const sockets = [];

  async function test(name, fn) {
    const start = performance.now();
    try {
      await fn();
      results.push({ name, passed: true, message: 'OK', duration: performance.now() - start });
    } catch (e) {
      results.push({ name, passed: false, message: e.message, duration: performance.now() - start });
    }
  }

  await test('GET /health', async () => {
    const res = await fetch(`${SERVER}/health`);
    const body = await res.json();
    if (!res.ok || body.status !== 'ok') throw new Error(JSON.stringify(body));
  });

  let roomCode = '';
  const playerIds = [];

  await test('Create room (User1)', async () => {
    const s = await connectClient();
    sockets.push(s);
    s.emit('create-room', { playerName: 'User1', maxPlayers: 8, matchSettings: { format: 'T10' } });
    const room = await once(s, 'room-created');
    roomCode = room.code;
    playerIds.push(room.players[0].id);
  });

  await test('Join 3 players (User2-4)', async () => {
    for (const name of ['User2', 'User3', 'User4']) {
      const s = await connectClient();
      sockets.push(s);
      s.emit('join-room', { roomCode, playerName: name });
      const room = await once(s, 'room-joined');
      const me = room.players.find((p) => p.name === name);
      if (!me) throw new Error(`Missing ${name}`);
      playerIds.push(me.id);
    }
  });

  await test('Reject duplicate player name', async () => {
    const s = await connectClient();
    s.emit('join-room', { roomCode, playerName: 'User2' });
    const err = await onceError(s);
    s.disconnect();
    if (!err || !String(err).includes('already taken')) throw new Error(`Expected duplicate error, got: ${err}`);
  });

  const gameSockets = () => sockets.slice(0, 4);

  await test('Assign teams 2v2', async () => {
    const host = sockets[0];
    const [p1, p2, p3, p4] = playerIds;
    const p = new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('teams timeout')), 5000);
      host.once('teams-updated', (teams) => { clearTimeout(t); resolve(teams); });
      host.once('error', (m) => { clearTimeout(t); reject(new Error(m)); });
    });
    host.emit('assign-team', {
      teamA: { name: 'Team A', playerIds: [p1, p2], captainId: p1 },
      teamB: { name: 'Team B', playerIds: [p3, p4], captainId: p3 },
    });
    const teams = await p;
    if (teams.length !== 2) throw new Error('Expected 2 teams');
  });

  await test('All ready + start match', async () => {
    for (const s of gameSockets()) s.emit('player-ready', true);
    await delay(300);
    const host = gameSockets()[0];
    const matchPromise = new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('match-started timeout')), 5000);
      host.once('match-started', (m) => { clearTimeout(t); resolve(m); });
      host.once('error', (m) => { clearTimeout(t); reject(new Error(m)); });
    });
    host.emit('start-match');
    const m = await matchPromise;
    if (m.phase !== 'toss') throw new Error(`Expected toss phase, got ${m.phase}`);
  });

  await test('Toss + innings + dual submit-move', async () => {
    const gs = gameSockets();
    const host = gs[0];
    host.emit('coin-toss', { choice: 'heads' });
    const toss = await once(host, 'toss-result', 5000);
    await delay(TOSS_DELAY);

    const winnerIdx = playerIds.indexOf(toss.winnerId);
    const winnerSocket = gs[winnerIdx] ?? host;
    const inningsPromise = once(host, 'innings-start', 8000);
    const ballWaitPromise = once(host, 'ball-waiting', 8000);
    winnerSocket.emit('innings-decision', { choice: 'bat' });
    const inningsData = await inningsPromise;
    const liveState = inningsData.liveState ?? (await ballWaitPromise);
    await ballWaitPromise.catch(() => {});

    const batterIdx = playerIds.indexOf(liveState.batsmanId);
    const bowlerIdx = playerIds.indexOf(liveState.bowlerId);
    const batterSocket = gs[batterIdx];
    const bowlerSocket = gs[bowlerIdx];

    if (!batterSocket || !bowlerSocket) {
      throw new Error(`Socket map failed batter=${batterIdx} bowler=${bowlerIdx}`);
    }
    if (batterSocket === bowlerSocket) throw new Error('Batter and bowler must be different sockets');

    const bowlerResult = await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('bowler move timeout')), 5000);
      bowlerSocket.once('move-accepted', (d) => { clearTimeout(t); resolve(d); });
      bowlerSocket.once('error', (m) => { clearTimeout(t); reject(new Error(m)); });
      bowlerSocket.emit('submit-move', { number: 2 });
    });
    if (bowlerResult.role !== 'bowler') throw new Error('Expected bowler role');

    const spectator = gs.find((s) => s !== batterSocket && s !== bowlerSocket);
    const specErr = await new Promise((resolve) => {
      spectator.once('error', resolve);
      spectator.emit('submit-move', { number: 3 });
      setTimeout(() => resolve(null), 800);
    });
    if (!specErr) throw new Error('Spectator submit should be rejected');

    const ballResultPromise = once(host, 'ball-result', 8000);
    batterSocket.emit('submit-move', { number: 5 });
    const ballResult = await ballResultPromise;
    if (ballResult.ball.runs !== 5) throw new Error(`Expected 5 runs, got ${ballResult.ball.runs}`);
    if (ballResult.ball.isWicket) throw new Error('Should not be out');
    if (ballResult.liveState.batsmanId === ballResult.liveState.bowlerId) {
      throw new Error('Same player is batter and bowler');
    }
  });

  await test('Next ball-waiting after reveal', async () => {
    const host = gameSockets()[0];
    const live = await once(host, 'ball-waiting', 10000);
    if (!live.batsmanId || !live.bowlerId) throw new Error('Missing batter/bowler');
    if (live.batsmanId === live.bowlerId) throw new Error('Same player is batter and bowler');
  });

  sockets.forEach((s) => s.disconnect());
  return results;
}

function printResults(title, results) {
  console.log(`\n=== ${title} ===`);
  let passed = 0;
  for (const r of results) {
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.name} (${r.duration.toFixed(1)}ms)${r.passed ? '' : ' — ' + r.message}`);
    if (r.passed) passed++;
  }
  console.log(`\n${passed}/${results.length} passed`);
  return passed === results.length;
}

console.log('Handy Cricket League — Test Runner');
console.log(`Server: ${SERVER}`);

const unitOk = printResults('Unit Tests', runUnitTests());

let integrationOk = true;
try {
  await fetch(`${SERVER}/health`);
  integrationOk = printResults('Socket.IO Integration', await runSocketIntegration());
} catch (e) {
  console.log('\n=== Socket.IO Integration ===');
  console.log(`[SKIP] Server not running at ${SERVER} — start with: npm run dev`);
  console.log(`       ${e.message}`);
  integrationOk = false;
}

process.exit(unitOk && integrationOk ? 0 : 1);
