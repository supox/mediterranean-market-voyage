
import React, { useState } from "react";
import LeaderboardModal from "./LeaderboardModal";
import NameInputModal from "./NameInputModal";
import {
  qualifiesForLeaderboard,
  addToLeaderboard,
  LeaderboardEntry,
} from "@/utils/leaderboard";

interface GameOverProps {
  balance: number;
  cargo: { type: string; amount: number }[];
  onPlayAgain: () => void;
}

// Remove cargo value display, add leaderboard UI
const GameOver: React.FC<GameOverProps> = ({ balance, cargo, onPlayAgain }) => {
  // Modal state for showing leaderboard and name input (local only, not managed by parent)
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNameInput, setShowNameInput] = useState(() =>
    qualifiesForLeaderboard(balance)
  );
  // Only allow submission once
  const [nameSubmitted, setNameSubmitted] = useState(false);

  // When the user submits a name, add score to leaderboard and open it
  function handleNameSubmit(name: string) {
    const entry: LeaderboardEntry = {
      name,
      score: balance,
      date: new Date().toISOString(),
    };
    addToLeaderboard(entry);
    setNameSubmitted(true);
    setShowNameInput(false);
    setTimeout(() => setShowLeaderboard(true), 200);
  }

  // If not in top 10, allow viewing leaderboard
  function handleShowLeaderboard() {
    setShowLeaderboard(true);
  }

  return (
    <div className="bg-white border border-green-100 p-8 rounded-xl shadow text-center animate-fade-in" dir="rtl">
      <h2 className="text-2xl font-bold mb-2">סיום המשחק!</h2>
      <div className="mb-1">
        <span className="font-medium">מאזן סופי:</span>{" "}
        <span className="text-green-700 font-extrabold text-2xl">
          {balance.toLocaleString()} ₪
        </span>
      </div>
      {/* No cargo value here anymore */}
      <div className="flex flex-col items-center gap-2 mt-6">
        <button
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow rounded-lg font-bold text-lg w-full"
          onClick={onPlayAgain}
        >
          שחק שוב
        </button>
        <button
          className="px-5 py-2 border border-blue-500 rounded-lg hover:bg-blue-50 text-blue-700 font-bold text-lg w-full"
          onClick={handleShowLeaderboard}
        >
          הצג לוח תוצאות
        </button>
      </div>
      <NameInputModal
        open={showNameInput && !nameSubmitted}
        onSubmit={handleNameSubmit}
        onCancel={() => setShowNameInput(false)}
        balance={balance}
      />
      <LeaderboardModal open={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
};

export default GameOver;
