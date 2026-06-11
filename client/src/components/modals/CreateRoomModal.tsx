'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGameStore } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';
import { useSocket } from '@/hooks/useSocket';
import { MatchFormat } from '@hcl/shared';
import { sounds } from '@/lib/sounds';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  defaultPlayerName?: string;
}

export function CreateRoomModal({ open, onClose, defaultPlayerName }: CreateRoomModalProps) {
  const profile = useProfileStore((s) => s.profile);
  const [hostName, setHostName] = useState(defaultPlayerName ?? profile.name ?? 'Player');
  const { setMatchSettings } = useGameStore();
  const { createRoom } = useSocket();

  const [roomName, setRoomName] = useState('My Room');
  const [format, setFormat] = useState<MatchFormat>('T20');
  const [teamSize, setTeamSize] = useState(2);
  const [overs, setOvers] = useState(20);
  const [isPrivate, setIsPrivate] = useState(true);

  const handleCreate = () => {
    const name = hostName.trim() || 'Player';
    sounds.click();
    setMatchSettings({
      format,
      overs: format === 'CUSTOM' ? overs : undefined,
      playersPerTeam: teamSize,
      maxWickets: teamSize - 1,
      matchName: roomName,
    });
    createRoom(name, teamSize * 2);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Room">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Room Name</label>
          <input
            className="input-field mt-1"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Match Format</label>
          <select
            className="input-field mt-1"
            value={format}
            onChange={(e) => setFormat(e.target.value as MatchFormat)}
          >
            <option value="T10">T10</option>
            <option value="T20">T20</option>
            <option value="TEST">Test</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Team Size</label>
            <select
              className="input-field mt-1"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} per team</option>
              ))}
            </select>
          </div>
          {format === 'CUSTOM' && (
            <div>
              <label className="text-sm text-gray-400">Overs</label>
              <input
                type="number"
                className="input-field mt-1"
                value={overs}
                min={1}
                max={90}
                onChange={(e) => setOvers(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="accent-stadium-green"
          />
          <span className="text-sm text-gray-300">Private Room (code required)</span>
        </label>

        <input
          className="input-field"
          placeholder="Host Name"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
        />

        <button onClick={handleCreate} className="btn-primary w-full">
          Generate Room
        </button>
      </div>
    </Modal>
  );
}
