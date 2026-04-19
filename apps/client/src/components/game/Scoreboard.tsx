import { useEffect, useState } from 'react';
import { useCountUp } from '../../hooks/useCountUp';

interface ScoreboardProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  current: string;
  currentTeam: 1 | 2;
}

export function Scoreboard({ team1Name, team2Name, team1Score, team2Score, current, currentTeam }: ScoreboardProps) {
  const team1Animated = useCountUp(team1Score);
  const team2Animated = useCountUp(team2Score);
  const [team1Flash, setTeam1Flash] = useState(false);
  const [team2Flash, setTeam2Flash] = useState(false);

  useEffect(() => {
    setTeam1Flash(true);
    const id = window.setTimeout(() => setTeam1Flash(false), 500);
    return () => window.clearTimeout(id);
  }, [team1Score]);

  useEffect(() => {
    setTeam2Flash(true);
    const id = window.setTimeout(() => setTeam2Flash(false), 500);
    return () => window.clearTimeout(id);
  }, [team2Score]);

  return (
    <div className="card grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 md:px-5 md:py-4">
      <div className="rounded border border-team1/40 bg-[rgba(230,62,103,0.12)] px-3 py-2 md:px-4">
        <div className="text-sm font-display tracking-[0.16em] text-team1">{team1Name}</div>
        <div
          className={`font-score text-5xl leading-none text-team1 md:text-6xl ${team1Flash ? 'animate-bounce-in rounded px-1 ring-2 ring-gold/70' : ''}`}
          aria-live="polite"
        >
          {team1Animated}
        </div>
      </div>
      <div
        className={`rounded border px-3 py-2 text-center ${
          currentTeam === 1
            ? 'border-team1/50 bg-[rgba(230,62,103,0.12)]'
            : 'border-team2/50 bg-[rgba(47,141,240,0.12)]'
        }`}
      >
        <div className={`text-xs font-display tracking-[0.18em] ${currentTeam === 1 ? 'text-team1' : 'text-team2'}`}>
          NOW PLAYING
        </div>
        <div className={`text-base font-display md:text-xl ${currentTeam === 1 ? 'text-team1' : 'text-team2'}`}>{current}</div>
      </div>
      <div className="rounded border border-team2/40 bg-[rgba(47,141,240,0.12)] px-3 py-2 text-right md:px-4">
        <div className="text-sm font-display tracking-[0.16em] text-team2">{team2Name}</div>
        <div
          className={`font-score text-5xl leading-none text-team2 md:text-6xl ${team2Flash ? 'animate-bounce-in rounded px-1 ring-2 ring-gold/70' : ''}`}
          aria-live="polite"
        >
          {team2Animated}
        </div>
      </div>
    </div>
  );
}
