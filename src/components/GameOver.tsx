
import React from "react";

interface GameOverProps {
  balance: number;
  cargo: { type: string; amount: number }[];
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ balance, cargo, onPlayAgain }) => (
  <div className="bg-white border border-green-100 p-8 rounded-xl shadow text-center animate-fade-in">
    <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
    <div className="mb-1">
      <span className="font-medium">Final Balance:</span>{" "}
      <span className="text-green-700 font-extrabold text-2xl">
        {balance.toLocaleString()} ₪
      </span>
    </div>
    <div className="mb-2">
      <span className="font-medium">Cargo Value (mock):</span>{" "}
      <span className="text-blue-800">
        ~{(cargo.reduce((acc, g) => acc + (g.amount * 14), 0)).toLocaleString()} ₪
      </span>
    </div>
    <button
      className="mt-5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow rounded-lg font-bold text-lg"
      onClick={onPlayAgain}
    >
      Play Again
    </button>
  </div>
);

export default GameOver;
