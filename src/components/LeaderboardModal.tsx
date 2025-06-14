
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadLeaderboard } from "@/utils/leaderboard";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  open,
  onClose,
}) => {
  const scores = loadLeaderboard();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-800 font-bold text-center">לוח תוצאות - עשרת הגדולים</DialogTitle>
        </DialogHeader>
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-right text-base mt-2">
            <thead>
              <tr>
                <th className="py-1">#</th>
                <th className="py-1">שם</th>
                <th className="py-1">מאזן</th>
                <th className="py-1">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-2">
                    לוח התוצאות ריק - תהיה הראשון להיכנס!
                  </td>
                </tr>
              )}
              {scores.map((entry, idx) => (
                <tr key={entry.name + entry.score + entry.date}>
                  <td>{idx + 1}</td>
                  <td className="font-semibold text-blue-900">{entry.name}</td>
                  <td className="font-bold text-green-800">{entry.score.toLocaleString()} ₪</td>
                  <td className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString("he-IL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onClose}
        >
          סגור
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;
