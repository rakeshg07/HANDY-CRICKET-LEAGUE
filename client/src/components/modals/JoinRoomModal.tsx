'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useProfileStore } from '@/store/profileStore';
import { useSocket } from '@/hooks/useSocket';
import { sounds } from '@/lib/sounds';

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
  defaultPlayerName?: string;
}

export function JoinRoomModal({ open, onClose, defaultPlayerName }: JoinRoomModalProps) {
  const profile = useProfileStore((s) => s.profile);
  const { joinRoom } = useSocket();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(defaultPlayerName ?? profile.name ?? 'Player');
  const [mode, setMode] = useState<'code' | 'quick'>('code');

  const handleJoin = () => {
    if (!roomCode.trim() || !playerName.trim()) return;
    sounds.click();
    joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Join Room">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('code')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              mode === 'code' ? 'bg-stadium-green/20 text-stadium-green' : 'glass text-gray-400'
            }`}
          >
            Room Code
          </button>
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              mode === 'quick' ? 'bg-stadium-green/20 text-stadium-green' : 'glass text-gray-400'
            }`}
          >
            Quick Join
          </button>
        </div>

        {mode === 'code' ? (
          <>
            <input
              className="input-field uppercase tracking-[0.3em] text-center text-xl font-mono"
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-character code from your host
            </p>
          </>
        ) : (
          <div className="text-center py-6 glass rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Quick Join</p>
            <p className="text-xs text-gray-500">
              Enter a room code to join. Public room browser coming soon.
            </p>
            <input
              className="input-field mt-4 uppercase tracking-[0.3em] text-center font-mono"
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
        )}

        <input
          className="input-field"
          placeholder="Your Name (unique per device)"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        <p className="text-xs text-gray-500">
          Use a different name in each browser tab
        </p>

        <button
          onClick={handleJoin}
          disabled={roomCode.length < 4}
          className="btn-primary w-full disabled:opacity-50"
        >
          Join Lobby
        </button>
      </div>
    </Modal>
  );
}
