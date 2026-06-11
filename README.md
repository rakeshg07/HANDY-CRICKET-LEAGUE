# Handy Cricket League

Real-time multiplayer hand cricket web game built with Next.js 15, Socket.IO, and TypeScript.

## Quick Start

```bash
# Install dependencies
npm install

# Build shared types
npm run build --workspace=shared

# Run development (server + client)
npm run dev
```

- **Client**: http://localhost:3000
- **Server**: http://localhost:3001

## Project Structure

```
handy-cricket-league/
├── shared/          # TypeScript types, constants, utilities
├── server/          # Express + Socket.IO game engine
│   └── src/
│       ├── game/    # MatchEngine, RoomManager
│       └── socket/  # Socket event handlers
└── client/          # Next.js 15 frontend
    └── src/
        ├── components/
        ├── hooks/
        ├── store/
        └── lib/
```

## MVP Features

- **Landing Page** — Create Room, Join Room, Profile, Rules, Test Match shortcuts
- **Header Navigation** — Home, Profile, Rules, Test Match, Settings, online status
- **Profile** — Local storage, avatar, stats, recent matches
- **Rules** — Visual examples with animations
- **Test Match Mode** — Full offline gameplay without Socket.IO
- **Developer Mode** — Live state JSON, debug panel, manual controls
- **Test Suite** — `/test-page` with 18+ automated validation tests

## Game Flow

1. **Create/Join Room** — Modal with room name, format, team size, overs
2. **Lobby** — Room code copy, ready status, team selection, start match
3. **Team Formation** — 2v2, 4v4, 6v6, N vs N with equal teams
4. **Toss** — Coin flip animation, bat/bowl decision
5. **Match** — Simultaneous hand emoji selection, ball reveal
6. **Result** — Score comparison, confetti on victory

## Multiplayer Test Mode

Navigate to **Multiplayer Test** from the header. Requires the Socket.IO server.

1. Open **4 browser tabs** — each tab is a separate player/device
2. Tab 1: Create room as `User1` (host)
3. Tabs 2–4: Join with `User2`, `User3`, `User4` (unique names enforced)
4. Ready → Auto-balance teams → Start match
5. Only the **active batter** and **active bowler** can submit moves
6. All other players spectate until their turn

### Player States

| State | Can Submit? |
|-------|-------------|
| BATTING | Yes (shot selection) |
| BOWLING | Yes (bowl selection) |
| SPECTATING | No |
| WAITING | No (next to bat) |
| OUT | No |

Server is the source of truth. Moves are hidden until both players submit.

## Socket Events

| Client → Server | Server → Client |
|----------------|-----------------|
| `create-room` | `room-created` |
| `join-room` | `room-joined` |
| `player-ready` | `player-ready` |
| `update-teams` | `teams-updated` |
| `start-match` | `match-started` |
| `coin-toss` | `toss-result` |
| `innings-decision` | `innings-start` |
| `choose-number` | `ball-result` |
| `reconnect` | `match-end` |

## Match Formats

- **T10** — 10 overs
- **T20** — 20 overs
- **TEST** — 90 overs
- **CUSTOM** — Configurable overs, wickets, players

## Environment Variables

```env
# client/.env.local
NEXT_PUBLIC_SERVER_URL=http://localhost:3001

# server
PORT=3001
CLIENT_URL=http://localhost:3000
```
